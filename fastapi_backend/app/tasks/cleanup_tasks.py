from datetime import datetime
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.models import RefreshToken
from loguru import logger

async def cleanup_expired_tokens():
    """Remove expired refresh tokens from database."""
    async with AsyncSessionLocal() as session:
        stmt = delete(RefreshToken).where(RefreshToken.expires_at < datetime.utcnow())
        result = await session.execute(stmt)
        await session.commit()
        logger.info(f"Cleaned up {result.rowcount} expired refresh tokens.")
