from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import User, Resource, SavedResource
from app.schemas.resource import (
    ResourceSearchRequest, ResourceSaveRequest,
    SavedResourceResponse, SavedResourceListResponse
)
from app.api.deps import get_current_user
from app.services.search_service import search_service

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.post("/search")
async def search_resources(
    payload: ResourceSearchRequest,
    current_user: User = Depends(get_current_user)
):
    results = await search_service.search_all([payload.query], payload.types)
    return {"query": payload.query, "results": results[:payload.limit]}

@router.post("/save", response_model=SavedResourceResponse)
async def save_resource(
    payload: ResourceSaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if already saved
    stmt = select(SavedResource).where(
        SavedResource.user_id == current_user.id,
        SavedResource.resource_id == payload.resource_id
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        existing.personal_note = payload.personal_note
        existing.tags = payload.tags
        await db.commit()
        await db.refresh(existing)
        return existing

    saved = SavedResource(
        user_id=current_user.id,
        resource_id=payload.resource_id,
        personal_note=payload.personal_note,
        tags=payload.tags
    )
    db.add(saved)
    await db.commit()
    await db.refresh(saved)
    return saved

@router.delete("/unsave/{resource_id}")
async def unsave_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavedResource).where(
        SavedResource.user_id == current_user.id,
        SavedResource.resource_id == resource_id
    )
    saved = (await db.execute(stmt)).scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.commit()
    return {"message": "Resource removed from library."}

@router.get("/library", response_model=SavedResourceListResponse)
async def get_library(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count_stmt = select(func.count(SavedResource.id)).where(SavedResource.user_id == current_user.id)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(SavedResource)
        .options(selectinload(SavedResource.resource))
        .where(SavedResource.user_id == current_user.id)
        .order_by(desc(SavedResource.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = (await db.execute(stmt)).scalars().all()

    return SavedResourceListResponse(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size
    )
