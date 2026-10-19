from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.courses import router as courses_router
from app.api.v1.resources import router as resources_router
from app.api.v1.progress import router as progress_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(courses_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(progress_router)
api_v1_router.include_router(admin_router)
