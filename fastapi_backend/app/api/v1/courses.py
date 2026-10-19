import json
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.exceptions import CourseNotFoundException, UnauthorizedAccessException
from app.models import Course, Module, Lesson, Resource, User, CourseStatus, Difficulty, ResourceType
from app.schemas.course import (
    CourseCreate, CourseResponse, CourseListResponse, GenerateCourseRequest,
    CurationUpdateRequest
)
from app.api.deps import get_current_user, get_optional_user
from app.tasks.course_tasks import (
    execute_course_generation, subscribe_generation, unsubscribe_generation
)
from app.services.export_service import export_service

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("", response_model=CourseResponse)
async def create_course(
    payload: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    course = Course(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description or f"AI-curated learning path for {payload.title}",
        status=CourseStatus.DRAFT,
        difficulty=payload.difficulty or Difficulty.BEGINNER,
        tags=payload.tags or [payload.title.lower()]
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    
    # Reload with empty modules
    stmt = select(Course).options(selectinload(Course.modules)).where(Course.id == course.id)
    refreshed = (await db.execute(stmt)).scalar_one()
    return refreshed

@router.get("", response_model=CourseListResponse)
async def list_user_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Course).where(Course.user_id == current_user.id)
    if status:
        query = query.where(Course.status == status)

    # Count total
    count_query = select(func.count(Course.id)).where(Course.user_id == current_user.id)
    if status:
        count_query = count_query.where(Course.status == status)
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate with modules preloaded
    query = (
        query.options(
            selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.resources)
        )
        .order_by(desc(Course.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = result.scalars().all()

    return CourseListResponse(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course_details(
    course_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.resources)
        )
        .where(Course.id == course_id)
    )
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()

    if not course:
        raise CourseNotFoundException()

    # Allow if owner or public
    if not course.is_public and (not current_user or course.user_id != current_user.id):
        raise UnauthorizedAccessException()

    return course

@router.post("/{course_id}/generate")
async def trigger_course_generation(
    course_id: str,
    payload: GenerateCourseRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Course).where(Course.id == course_id)
    course = (await db.execute(stmt)).scalar_one_or_none()

    if not course:
        raise CourseNotFoundException()
    if course.user_id != current_user.id:
        raise UnauthorizedAccessException()

    course.title = payload.topic.title()
    course.difficulty = payload.difficulty
    course.status = CourseStatus.GENERATING
    await db.commit()

    # Trigger background generation pipeline
    background_tasks.add_task(
        execute_course_generation,
        course_id=course.id,
        topic=payload.topic,
        difficulty=payload.difficulty.value,
        sources=payload.sources
    )

    return {"message": "Course generation started successfully", "course_id": course.id, "status": "generating"}

@router.websocket("/{course_id}/generation-status")
async def websocket_generation_status(websocket: WebSocket, course_id: str):
    await websocket.accept()
    queue = subscribe_generation(course_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event)
            if event.get("stage") in ("done", "failed"):
                break
    except WebSocketDisconnect:
        pass
    finally:
        unsubscribe_generation(course_id, queue)

@router.get("/{course_id}/generation-stream")
async def sse_generation_stream(course_id: str):
    """Server-Sent Events fallback for browser stream."""
    queue = subscribe_generation(course_id)

    async def event_generator():
        try:
            while True:
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
                if event.get("stage") in ("done", "failed"):
                    break
        finally:
            unsubscribe_generation(course_id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.patch("/{course_id}/curate", response_model=CourseResponse)
async def curate_course(
    course_id: str,
    payload: CurationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.resources)
        )
        .where(Course.id == course_id)
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise CourseNotFoundException()
    if course.user_id != current_user.id:
        raise UnauthorizedAccessException()

    if payload.title:
        course.title = payload.title
    if payload.description:
        course.description = payload.description
    if payload.difficulty:
        course.difficulty = payload.difficulty

    # Replace modules with curated tree
    for old_m in list(course.modules):
        await db.delete(old_m)
    await db.flush()

    for m_idx, m_in in enumerate(payload.modules):
        mod = Module(
            course_id=course.id,
            title=m_in.title,
            description=m_in.description,
            order=m_in.order or m_idx
        )
        db.add(mod)
        await db.flush()

        for l_idx, l_in in enumerate(m_in.lessons):
            lesson = Lesson(
                module_id=mod.id,
                title=l_in.title,
                description=l_in.description,
                order=l_in.order or l_idx,
                duration_minutes=l_in.duration_minutes
            )
            db.add(lesson)
            await db.flush()

            for r_idx, r_in in enumerate(l_in.resources):
                res = Resource(
                    lesson_id=lesson.id,
                    type=r_in.type,
                    title=r_in.title,
                    url=r_in.url,
                    thumbnail_url=r_in.thumbnail_url,
                    provider=r_in.provider,
                    provider_id=r_in.provider_id,
                    duration_seconds=r_in.duration_seconds,
                    order=r_in.order or r_idx,
                    is_primary=r_in.is_primary
                )
                db.add(res)

    await db.commit()
    
    # Return refreshed course
    refreshed = (await db.execute(stmt)).scalar_one()
    return refreshed

@router.post("/{course_id}/publish")
async def publish_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Course).where(Course.id == course_id)
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise CourseNotFoundException()
    if course.user_id != current_user.id:
        raise UnauthorizedAccessException()

    if not course.share_slug:
        slug_base = course.title.lower().replace(" ", "-")[:40]
        course.share_slug = f"{slug_base}-{str(uuid.uuid4())[:8]}"

    course.is_public = True
    await db.commit()

    return {
        "message": "Course published successfully",
        "share_slug": course.share_slug,
        "public_url": f"{settings.FRONTEND_URL}/c/{course.share_slug}"
    }

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Course).where(Course.id == course_id)
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise CourseNotFoundException()
    if course.user_id != current_user.id:
        raise UnauthorizedAccessException()

    await db.delete(course)
    await db.commit()
    return {"message": "Course deleted successfully"}

@router.get("/{course_id}/export")
async def export_course_markdown(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.resources)
        )
        .where(Course.id == course_id)
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise CourseNotFoundException()

    md_content = export_service.to_markdown(course)
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={course.title.replace(' ', '_')}.md"}
    )

@router.post("/{course_id}/save")
async def toggle_save_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Course).where(Course.id == course_id)
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise CourseNotFoundException()

    prefs = dict(current_user.preferences or {})
    saved = list(prefs.get("saved_courses", []))

    if course_id in saved:
        saved.remove(course_id)
        is_saved = False
        message = "Course removed from saved library"
    else:
        saved.append(course_id)
        is_saved = True
        message = "Course saved to library successfully"

    prefs["saved_courses"] = saved
    current_user.preferences = prefs
    await db.commit()

    return {
        "course_id": course_id,
        "is_saved": is_saved,
        "message": message,
        "saved_courses": saved
    }

@router.get("/user/saved", response_model=CourseListResponse)
async def get_saved_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    prefs = current_user.preferences or {}
    saved_ids = list(prefs.get("saved_courses", []))
    if not saved_ids:
        return CourseListResponse(items=[], total=0, page=1, page_size=50)

    stmt = (
        select(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.resources)
        )
        .where(Course.id.in_(saved_ids))
    )
    result = await db.execute(stmt)
    courses = result.scalars().all()

    return CourseListResponse(
        items=list(courses),
        total=len(courses),
        page=1,
        page_size=50
    )

