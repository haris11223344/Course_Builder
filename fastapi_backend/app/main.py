from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from app.core.config import settings
from app.core.database import init_db
from app.api.router import api_v1_router

# Configure loguru
logger.remove()
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CourseForge backend...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to auto-initialize database on startup: {e}")
    yield
    logger.info("Shutting down CourseForge backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="CourseForge - AI-Powered Course Generator API",
    lifespan=lifespan
)

# CORS Configuration
origins = settings.BACKEND_CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(api_v1_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.APP_ENV
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to CourseForge API. Visit /docs for Swagger UI documentation.",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
