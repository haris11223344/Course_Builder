from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models import UserRole, Provider

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password minimum 8 chars")
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"

class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None

from app.schemas.user import UserResponse
TokenResponse.model_rebuild()
