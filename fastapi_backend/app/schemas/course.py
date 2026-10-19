from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models import CourseStatus, Difficulty, ResourceType

class ResourceResponse(BaseModel):
    id: str
    lesson_id: str
    type: ResourceType
    title: str
    url: str
    thumbnail_url: Optional[str] = None
    provider: Optional[str] = None
    provider_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata_: Dict[str, Any] = {}
    order: int
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True

class LessonResponse(BaseModel):
    id: str
    module_id: str
    title: str
    description: Optional[str] = None
    order: int
    duration_minutes: Optional[int] = None
    resources: List[ResourceResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ModuleResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order: int
    lessons: List[LessonResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: CourseStatus
    difficulty: Difficulty
    estimated_hours: Optional[float] = None
    tags: List[str] = []
    curriculum_snapshot: Dict[str, Any] = {}
    is_public: bool
    share_slug: Optional[str] = None
    modules: List[ModuleResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CourseListResponse(BaseModel):
    items: List[CourseResponse]
    total: int
    page: int
    page_size: int

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[Difficulty] = Difficulty.BEGINNER
    tags: Optional[List[str]] = []

class GenerateCourseRequest(BaseModel):
    topic: str
    difficulty: Difficulty = Difficulty.BEGINNER
    sources: List[str] = ["youtube", "web", "github"]
    learning_goals: Optional[str] = None
    estimated_hours: Optional[float] = 10.0

class CurateResourceItem(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    type: ResourceType = ResourceType.VIDEO
    thumbnail_url: Optional[str] = None
    provider: Optional[str] = None
    provider_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    order: int = 0
    is_primary: bool = False

class CurateLessonItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    order: int = 0
    duration_minutes: Optional[int] = None
    resources: List[CurateResourceItem] = []

class CurateModuleItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    order: int = 0
    lessons: List[CurateLessonItem] = []

class CurationUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    modules: List[CurateModuleItem]
