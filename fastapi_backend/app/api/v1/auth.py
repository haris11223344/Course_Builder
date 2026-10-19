from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, decode_token, hash_token, 
    set_auth_cookies, clear_auth_cookies
)
from app.core.exceptions import (
    InvalidCredentialsException, UserAlreadyExistsException, 
    InvalidTokenException
)
from app.models import User, RefreshToken, Provider, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Check if user already exists
    stmt = select(User).where(User.email == payload.email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise UserAlreadyExistsException()

    # Create user
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name or payload.email.split("@")[0].title(),
        role=UserRole.USER,
        provider=Provider.EMAIL,
        is_verified=True,
        onboarding_completed=False,
        preferences={"theme": "dark", "difficulty": "beginner"}
    )
    db.add(user)
    await db.flush()

    # Issue tokens
    access_token = create_access_token(user.id)
    raw_refresh_token = create_refresh_token(user.id)
    
    # Store hashed refresh token in DB
    db_refresh = RefreshToken(
        token_hash=hash_token(raw_refresh_token),
        user_id=user.id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    await db.commit()
    await db.refresh(user)

    # Set HttpOnly cookies
    set_auth_cookies(response, access_token, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == payload.email)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user or not user.hashed_password:
        raise InvalidCredentialsException()

    if not verify_password(payload.password, user.hashed_password):
        raise InvalidCredentialsException()

    access_token = create_access_token(user.id)
    raw_refresh_token = create_refresh_token(user.id)

    db_refresh = RefreshToken(
        token_hash=hash_token(raw_refresh_token),
        user_id=user.id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    await db.commit()
    await db.refresh(user)

    set_auth_cookies(response, access_token, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    response: Response,
    request: Request,
    payload: Optional[RefreshRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    # Extract refresh token from cookie or body
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh and payload and payload.refresh_token:
        raw_refresh = payload.refresh_token

    if not raw_refresh:
        raise InvalidTokenException("Refresh token missing.")

    decoded = decode_token(raw_refresh)
    if not decoded or decoded.get("type") != "refresh":
        raise InvalidTokenException("Invalid refresh token payload.")

    user_id = decoded.get("sub")
    t_hash = hash_token(raw_refresh)

    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == t_hash,
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None)
    )
    token_record = (await db.execute(stmt)).scalar_one_or_none()

    if not token_record or token_record.expires_at < datetime.utcnow():
        raise InvalidTokenException("Refresh token expired or revoked.")

    # Revoke old refresh token (rotation)
    token_record.revoked_at = datetime.utcnow()

    # Create new pair
    new_access_token = create_access_token(user_id)
    new_raw_refresh = create_refresh_token(user_id)

    new_token_record = RefreshToken(
        token_hash=hash_token(new_raw_refresh),
        user_id=user_id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_token_record)

    user_stmt = select(User).where(User.id == user_id)
    user = (await db.execute(user_stmt)).scalar_one_or_none()
    await db.commit()

    set_auth_cookies(response, new_access_token, new_raw_refresh)

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    raw_refresh = request.cookies.get("refresh_token")
    if raw_refresh:
        t_hash = hash_token(raw_refresh)
        stmt = update(RefreshToken).where(RefreshToken.token_hash == t_hash).values(revoked_at=datetime.utcnow())
        await db.execute(stmt)
        await db.commit()

    clear_auth_cookies(response)
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/google")
async def google_login():
    """Mock/Redirect Google OAuth endpoint."""
    if not settings.GOOGLE_CLIENT_ID:
        # Dev simulated OAuth URL
        return {
            "message": "Google OAuth is configured. For development without client ID, use email registration or simulated callback.",
            "auth_url": f"{settings.FRONTEND_URL}/auth/login?mock_oauth=true"
        }
    return {
        "auth_url": f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri={settings.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile"
    }

@router.get("/google/callback")
async def google_callback(code: Optional[str] = None, response: Response = None):
    # Handled by OAuth flow
    return {"message": "Google callback received."}
