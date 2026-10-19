import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Response
from app.core.config import settings

import bcrypt

def hash_token(token: str) -> str:
    """Return SHA256 hash of a token string for secure DB lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None, claims: Optional[Dict[str, Any]] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    if claims:
        to_encode.update(claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    # 15 minutes access token
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False if settings.APP_ENV == "development" else True,
        path="/"
    )
    # 30 days refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        expires=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False if settings.APP_ENV == "development" else True,
        path="/"
    )

def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    response.delete_cookie(key="refresh_token", path="/", samesite="lax")
