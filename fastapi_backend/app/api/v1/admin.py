import os
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from app.core.database import get_db
from app.models import User, Course, Resource, UserProgress
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin & Database Explorer"])

@router.get("/metrics")
async def get_system_metrics(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    courses_count = (await db.execute(select(func.count(Course.id)))).scalar() or 0
    resources_count = (await db.execute(select(func.count(Resource.id)))).scalar() or 0
    completions_count = (await db.execute(
        select(func.count(UserProgress.id)).where(UserProgress.status == "completed")
    )).scalar() or 0

    return {
        "total_users": users_count,
        "total_courses": courses_count,
        "total_curated_resources": resources_count,
        "total_lessons_completed": completions_count,
        "system_status": "healthy"
    }

@router.get("/database/overview")
async def get_database_overview(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Inspect all database tables, row counts, and storage stats (Admin Only)."""
    try:
        # SQLite or MySQL table list
        res = await db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
        table_names = [row[0] for row in res.fetchall()]
    except Exception:
        # Fallback for MySQL if running on MySQL
        try:
            res = await db.execute(text("SHOW TABLES"))
            table_names = [row[0] for row in res.fetchall()]
        except Exception as e:
            table_names = ["users", "courses", "modules", "lessons", "resources", "user_progress"]

    tables_info = []
    for t in table_names:
        try:
            cnt_res = await db.execute(text(f"SELECT COUNT(*) FROM {t}"))
            count = cnt_res.scalar() or 0
            tables_info.append({"name": t, "count": count})
        except Exception:
            pass

    db_path = os.path.abspath("courseforge.db")
    file_size_bytes = os.path.getsize(db_path) if os.path.exists(db_path) else 0

    return {
        "status": "connected",
        "database_type": "SQLite 3.x / SQLAlchemy 2.0 Async",
        "file_path": db_path,
        "file_size_kb": round(file_size_bytes / 1024, 2),
        "swagger_url": "http://localhost:8000/docs",
        "tables": tables_info
    }

@router.get("/database/table/{table_name}")
async def inspect_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """View records and column data for any database table."""
    allowed_tables = {"users", "courses", "modules", "lessons", "resources", "user_progress", "refresh_tokens", "saved_resources"}
    if table_name not in allowed_tables:
        raise HTTPException(status_code=400, detail=f"Invalid table '{table_name}'. Allowed: {sorted(allowed_tables)}")

    offset = (page - 1) * limit
    try:
        # Get count
        cnt_res = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        total = cnt_res.scalar() or 0

        # Fetch rows
        query_res = await db.execute(text(f"SELECT * FROM {table_name} LIMIT :limit OFFSET :offset"), {"limit": limit, "offset": offset})
        columns = list(query_res.keys())
        raw_rows = query_res.fetchall()

        rows = []
        for r in raw_rows:
            d = dict(zip(columns, r))
            # Redact security sensitive fields
            if "password_hash" in d and d["password_hash"]:
                d["password_hash"] = "[REDACTED_BCRYPT_HASH]"
            rows.append(d)

        return {
            "table": table_name,
            "columns": columns,
            "total_records": total,
            "page": page,
            "limit": limit,
            "records": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query table {table_name}: {str(e)}")

