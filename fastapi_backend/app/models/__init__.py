from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    String, Text, DateTime, ForeignKey, Enum, Boolean, 
    Integer, Index, UniqueConstraint, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.mysql import CHAR
import enum

class Base(DeclarativeBase):
    pass

# --- ENUMS ---
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class Provider(str, enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"

class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"

class ResourceType(str, enum.Enum):
    VIDEO = "video"
    ARTICLE = "article"
    DOCUMENTATION = "doc"
    GITHUB = "github"
    OTHER = "other"

class Difficulty(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

# --- MODELS ---
class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True) # Null for OAuth only
    full_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    provider: Mapped[Provider] = mapped_column(Enum(Provider), default=Provider.EMAIL)
    provider_id: Mapped[str | None] = mapped_column(String(100), nullable=True) # Google Sub ID
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    preferences: Mapped[dict] = mapped_column(JSON, default=dict) # {theme, default_sources, difficulty}
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    courses: Mapped[list["Course"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    saved_resources: Mapped[list["SavedResource"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False) # SHA256 hash
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(500))
    ip_address: Mapped[str | None] = mapped_column(String(45))
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[CourseStatus] = mapped_column(Enum(CourseStatus), default=CourseStatus.DRAFT, index=True)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty), default=Difficulty.BEGINNER)
    estimated_hours: Mapped[float | None] = mapped_column(nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    curriculum_snapshot: Mapped[dict] = mapped_column(JSON, default=dict) # Denormalized full structure for fast reads
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_slug: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner: Mapped["User"] = relationship(back_populates="courses")
    modules: Mapped[list["Module"]] = relationship(back_populates="course", cascade="all, delete-orphan", order_by="Module.order")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="course")

class Module(Base):
    __tablename__ = "modules"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    course: Mapped["Course"] = relationship(back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")

class Lesson(Base):
    __tablename__ = "lessons"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    module_id: Mapped[str] = mapped_column(String(36), ForeignKey("modules.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text) # Markdown supported
    order: Mapped[int] = mapped_column(Integer, default=0)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    module: Mapped["Module"] = relationship(back_populates="lessons")
    resources: Mapped[list["Resource"]] = relationship(back_populates="lesson", cascade="all, delete-orphan", order_by="Resource.order")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="lesson")

class Resource(Base):
    __tablename__ = "resources"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id: Mapped[str] = mapped_column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    type: Mapped[ResourceType] = mapped_column(Enum(ResourceType), nullable=False)
    title: Mapped[str] = mapped_column(String(300))
    url: Mapped[str] = mapped_column(String(1000)) # Original URL
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    provider: Mapped[str | None] = mapped_column(String(50)) # youtube, coursera, github, etc.
    provider_id: Mapped[str | None] = mapped_column(String(100)) # YouTube Video ID
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict) # Channel, Author, View Count, etc.
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False) # Main resource for the lesson
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    lesson: Mapped["Lesson"] = relationship(back_populates="resources")
    saved_by: Mapped[list["SavedResource"]] = relationship(back_populates="resource")

class UserProgress(Base):
    __tablename__ = "user_progress"
    __table_args__ = (UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[str] = mapped_column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started") # not_started, in_progress, completed
    watch_time_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="progress")
    course: Mapped["Course"] = relationship(back_populates="progress")
    lesson: Mapped["Lesson"] = relationship(back_populates="progress")

class SavedResource(Base):
    __tablename__ = "saved_resources"
    __table_args__ = (UniqueConstraint('user_id', 'resource_id', name='uq_user_resource'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[str] = mapped_column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), index=True)
    personal_note: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="saved_resources")
    resource: Mapped["Resource"] = relationship(back_populates="saved_by")
