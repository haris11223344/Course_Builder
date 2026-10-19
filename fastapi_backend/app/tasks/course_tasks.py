import asyncio
from typing import Dict, Any, List
from loguru import logger
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models import Course, Module, Lesson, Resource, CourseStatus, Difficulty, ResourceType
from app.services.ai_service import ai_service
from app.services.search_service import search_service
from app.services.scoring_service import scoring_service

# Global in-memory broadcast bus for live course generation status (WebSocket/SSE)
generation_subscribers: Dict[str, List[asyncio.Queue]] = {}

def subscribe_generation(course_id: str) -> asyncio.Queue:
    queue = asyncio.Queue()
    if course_id not in generation_subscribers:
        generation_subscribers[course_id] = []
    generation_subscribers[course_id].append(queue)
    return queue

def unsubscribe_generation(course_id: str, queue: asyncio.Queue) -> None:
    if course_id in generation_subscribers:
        generation_subscribers[course_id] = [q for q in generation_subscribers[course_id] if q != queue]
        if not generation_subscribers[course_id]:
            del generation_subscribers[course_id]

async def broadcast_status(course_id: str, stage: str, progress: int, message: str, payload: Any = None) -> None:
    event = {
        "course_id": course_id,
        "stage": stage,
        "progress": progress,
        "message": message,
        "payload": payload
    }
    queues = generation_subscribers.get(course_id, [])
    for q in queues:
        await q.put(event)

async def execute_course_generation(course_id: str, topic: str, difficulty: str = "beginner", sources: List[str] = None):
    """Full 4-stage AI generation pipeline."""
    if sources is None:
        sources = ["youtube", "web", "github"]

    logger.info(f"Starting course generation pipeline for course_id: {course_id}, topic: {topic}")
    
    async with AsyncSessionLocal() as session:
        # Mark course as generating
        stmt = select(Course).where(Course.id == course_id)
        result = await session.execute(stmt)
        course = result.scalar_one_or_none()
        if not course:
            logger.error(f"Course {course_id} not found.")
            return

        course.status = CourseStatus.GENERATING
        await session.commit()

        try:
            # Stage 1: Curriculum Planning
            await broadcast_status(course_id, "planning", 15, "AI Curriculum Designer is architecting syllabus...")
            await asyncio.sleep(1.0) # Smooth visual pacing for frontend UX
            
            curriculum = await ai_service.generate_curriculum(topic, difficulty, sources)
            
            course.title = curriculum.get("title", course.title)
            course.description = curriculum.get("description", course.description)
            course.estimated_hours = curriculum.get("estimated_hours", 10.0)
            course.tags = curriculum.get("tags", [topic.lower()])
            course.curriculum_snapshot = curriculum

            # Stage 2: Parallel Search & Scraping
            await broadcast_status(course_id, "searching", 45, "Searching YouTube, Web documentation, and GitHub repositories...")
            
            modules_data = curriculum.get("modules", [])
            total_lessons = sum(len(m.get("lessons", [])) for m in modules_data)
            processed_lessons = 0

            # Delete previous modules if rerunning
            await session.refresh(course, attribute_names=["modules"])
            for m in list(course.modules):
                await session.delete(m)
            await session.commit()

            used_video_ids = set()
            for m_idx, mod_spec in enumerate(modules_data):
                module = Module(
                    course_id=course.id,
                    title=mod_spec.get("title", f"Module {m_idx + 1}"),
                    description=mod_spec.get("description", ""),
                    order=m_idx
                )
                session.add(module)
                await session.flush()

                for l_idx, lesson_spec in enumerate(mod_spec.get("lessons", [])):
                    lesson = Lesson(
                        module_id=module.id,
                        title=lesson_spec.get("title", f"Lesson {l_idx + 1}"),
                        description=lesson_spec.get("description", ""),
                        order=l_idx,
                        duration_minutes=lesson_spec.get("duration_minutes", 20)
                    )
                    session.add(lesson)
                    await session.flush()

                    # Execute search queries for this lesson
                    queries = lesson_spec.get("search_queries", [lesson.title])
                    candidates = await search_service.search_all(queries, sources)
                    
                    # Stage 3: Scoring & Ranking
                    ranked_resources = scoring_service.rank_resources(candidates, lesson_spec)

                    # Ensure lesson primary video is fresh and unique across the course
                    lesson_primary_assigned = False
                    for r_spec in ranked_resources:
                        vid_id = r_spec.get("provider_id")
                        if r_spec.get("type") == "video":
                            if vid_id and vid_id not in used_video_ids and not lesson_primary_assigned:
                                r_spec["is_primary"] = True
                                lesson_primary_assigned = True
                                used_video_ids.add(vid_id)
                            elif lesson_primary_assigned and r_spec.get("is_primary"):
                                r_spec["is_primary"] = False

                    if not lesson_primary_assigned and ranked_resources:
                        for r_spec in ranked_resources:
                            if r_spec.get("type") == "video":
                                r_spec["is_primary"] = True
                                if r_spec.get("provider_id"):
                                    used_video_ids.add(r_spec["provider_id"])
                                break

                    for r_spec in ranked_resources:
                        res_type = ResourceType.VIDEO
                        t_str = r_spec.get("type", "video").lower()
                        if t_str == "doc":
                            res_type = ResourceType.DOCUMENTATION
                        elif t_str == "article":
                            res_type = ResourceType.ARTICLE
                        elif t_str == "github":
                            res_type = ResourceType.GITHUB

                        res = Resource(
                            lesson_id=lesson.id,
                            title=r_spec.get("title", "Resource"),
                            url=r_spec.get("url", ""),
                            type=res_type,
                            thumbnail_url=r_spec.get("thumbnail_url"),
                            provider=r_spec.get("provider", "web"),
                            provider_id=r_spec.get("provider_id"),
                            duration_seconds=r_spec.get("duration_seconds", 0),
                            metadata_=r_spec.get("metadata", {}),
                            order=r_spec.get("order", 0),
                            is_primary=r_spec.get("is_primary", False)
                        )
                        session.add(res)

                    processed_lessons += 1
                    pct = 45 + int((processed_lessons / max(1, total_lessons)) * 40)
                    await broadcast_status(course_id, "ranking", pct, f"Curating lesson {processed_lessons}/{total_lessons}: {lesson.title}")
                    await asyncio.sleep(0.3)

            # Stage 4: Persistence & Finalization
            await broadcast_status(course_id, "saving", 95, "Finalizing knowledge tree and snapshot...")
            course.status = CourseStatus.READY
            if not course.thumbnail_url:
                # Use primary video thumbnail if available
                first_res_stmt = (
                    select(Resource.thumbnail_url)
                    .join(Lesson, Resource.lesson_id == Lesson.id)
                    .join(Module, Lesson.module_id == Module.id)
                    .where(Module.course_id == course.id, Resource.is_primary == True)
                    .limit(1)
                )
                t_url = (await session.execute(first_res_stmt)).scalar_one_or_none()
                if t_url:
                    course.thumbnail_url = t_url

            await session.commit()
            await broadcast_status(course_id, "done", 100, "Course generated successfully! Ready to learn.", {"course_id": course.id})
            logger.info(f"Course {course_id} generation completed successfully.")

        except Exception as e:
            logger.error(f"Failed to generate course {course_id}: {e}", exc_info=True)
            course.status = CourseStatus.FAILED
            await session.commit()
            await broadcast_status(course_id, "failed", 0, f"Generation failed: {str(e)}")

# Celery Task Wrapper
try:
    from app.core.celery_app import celery_app
    @celery_app.task(name="generate_course_task")
    def generate_course_task(course_id: str, topic: str, difficulty: str, sources: List[str]):
        asyncio.run(execute_course_generation(course_id, topic, difficulty, sources))
except Exception:
    pass
