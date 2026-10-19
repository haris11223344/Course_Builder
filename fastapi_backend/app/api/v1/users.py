from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models import User
from app.schemas.user import UserResponse, UserUpdate, OnboardingRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.preferences is not None:
        merged = dict(current_user.preferences or {})
        merged.update(payload.preferences)
        current_user.preferences = merged

    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/onboarding", response_model=UserResponse)
async def complete_onboarding(
    payload: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.full_name:
        current_user.full_name = payload.full_name
    
    prefs = dict(current_user.preferences or {})
    if payload.learning_goals:
        prefs["learning_goals"] = payload.learning_goals
    if payload.preferred_difficulty:
        prefs["difficulty"] = payload.preferred_difficulty
    if payload.preferred_sources:
        prefs["default_sources"] = payload.preferred_sources
    if payload.weekly_hours:
        prefs["weekly_hours"] = payload.weekly_hours

    current_user.preferences = prefs
    current_user.onboarding_completed = True

    await db.commit()
    await db.refresh(current_user)
    return current_user
