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
    refresh_token: Optional[str] = None

class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None  # Google ID token / JWT
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_url: Optional[str] = None

class VerifyResetTokenResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    message: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password minimum 8 chars")

from app.schemas.user import UserResponse
TokenResponse.model_rebuild()
