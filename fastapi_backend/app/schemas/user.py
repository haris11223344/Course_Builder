from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from app.models import UserRole, Provider

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    provider: Provider
    is_verified: bool
    onboarding_completed: bool
    preferences: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class OnboardingRequest(BaseModel):
    full_name: Optional[str] = None
    learning_goals: Optional[list[str]] = None
    preferred_difficulty: Optional[str] = "beginner"
    preferred_sources: Optional[list[str]] = None
    weekly_hours: Optional[int] = 5
