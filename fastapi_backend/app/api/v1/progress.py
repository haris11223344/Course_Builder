from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models import User, Lesson, Module, Course, UserProgress
from app.schemas.progress import ProgressUpdateRequest, ProgressResponse, CourseStatsResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("/lesson/{lesson_id}", response_model=ProgressResponse)
async def update_lesson_progress(
    lesson_id: str,
    payload: ProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Lookup lesson and parent course
    stmt = (
        select(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .where(Lesson.id == lesson_id)
    )
    lesson = (await db.execute(stmt)).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    course_id = lesson.module.course_id

    # Lookup existing progress
    prog_stmt = select(UserProgress).where(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    )
    progress = (await db.execute(prog_stmt)).scalar_one_or_none()

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id,
            status=payload.status or "in_progress",
            watch_time_seconds=payload.watch_time_seconds or 0
        )
        if payload.status == "completed":
            progress.completed_at = datetime.utcnow()
        db.add(progress)
    else:
        if payload.status:
            progress.status = payload.status
            if payload.status == "completed" and not progress.completed_at:
                progress.completed_at = datetime.utcnow()
            elif payload.status != "completed":
                progress.completed_at = None
        if payload.watch_time_seconds is not None:
            progress.watch_time_seconds = payload.watch_time_seconds

    await db.commit()
    await db.refresh(progress)
    return progress

@router.get("/course/{course_id}", response_model=CourseStatsResponse)
async def get_course_stats(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Count total lessons in course
    lesson_count_stmt = (
        select(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .where(Module.course_id == course_id)
    )
    total_lessons = (await db.execute(lesson_count_stmt)).scalar() or 0

    # Count completed lessons for user
    completed_stmt = select(func.count(UserProgress.id)).where(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == course_id,
        UserProgress.status == "completed"
    )
    completed_lessons = (await db.execute(completed_stmt)).scalar() or 0

    # Count in-progress
    in_prog_stmt = select(func.count(UserProgress.id)).where(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == course_id,
        UserProgress.status == "in_progress"
    )
    in_progress_lessons = (await db.execute(in_prog_stmt)).scalar() or 0

    # Watch time sum
    time_stmt = select(func.coalesce(func.sum(UserProgress.watch_time_seconds), 0)).where(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == course_id
    )
    total_watch_time = (await db.execute(time_stmt)).scalar() or 0

    pct = round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0.0

    return CourseStatsResponse(
        course_id=course_id,
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        in_progress_lessons=in_progress_lessons,
        percent_completed=pct,
        total_watch_time_seconds=total_watch_time
    )
