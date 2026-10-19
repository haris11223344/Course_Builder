from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models import ResourceType
from app.schemas.course import ResourceResponse

class ResourceSearchRequest(BaseModel):
    query: str
    types: List[str] = ["video", "article", "doc", "github"]
    limit: int = 10

class ResourceSaveRequest(BaseModel):
    resource_id: str
    personal_note: Optional[str] = None
    tags: List[str] = []

class SavedResourceResponse(BaseModel):
    id: str
    user_id: str
    resource_id: str
    personal_note: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    resource: Optional[ResourceResponse] = None

    class Config:
        from_attributes = True

class SavedResourceListResponse(BaseModel):
    items: List[SavedResourceResponse]
    total: int
    page: int
    page_size: int
