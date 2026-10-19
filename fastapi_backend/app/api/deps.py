from typing import Optional, AsyncGenerator
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import InvalidTokenException, UserNotFoundException
from app.models import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> User:
    token: Optional[str] = None
    # 1. Try cookie first
    if "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    # 2. Try Authorization header
    elif auth_header:
        token = auth_header.credentials
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Access token missing."
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise InvalidTokenException()

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenException()

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise UserNotFoundException()

    return user

async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[User]:
    try:
        return await get_current_user(request=request, db=db, auth_header=auth_header)
    except Exception:
        return None

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    role_str = str(current_user.role.value if hasattr(current_user.role, "value") else current_user.role).lower()
    if role_str != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )
    return current_user
