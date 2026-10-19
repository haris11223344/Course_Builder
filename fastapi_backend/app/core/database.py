from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from app.core.config import settings
from app.models import Base
from loguru import logger

# Connection Pool Configuration
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

pool_kwargs = {}
if not is_sqlite:
    if settings.APP_ENV == "development":
        pool_kwargs["poolclass"] = NullPool
    else:
        pool_kwargs["poolclass"] = QueuePool
        pool_kwargs["pool_size"] = 10
        pool_kwargs["max_overflow"] = 20

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",
    future=True,
    **pool_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db() -> None:
    """Initialize database tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for yielding an async session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
