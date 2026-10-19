from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProgressUpdateRequest(BaseModel):
    status: Optional[str] = None  # not_started, in_progress, completed
    watch_time_seconds: Optional[int] = None

class ProgressResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    lesson_id: str
    status: str
    watch_time_seconds: int
    completed_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class CourseStatsResponse(BaseModel):
    course_id: str
    total_lessons: int
    completed_lessons: int
    in_progress_lessons: int
    percent_completed: float
    total_watch_time_seconds: int
