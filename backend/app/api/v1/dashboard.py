from fastapi import APIRouter, Depends
from sqlalchemy import func, select, union_all, literal
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.asset import Asset
from app.models.brand_kit import BrandKit
from app.models.generation_job import GenerationJob
from app.models.template import Template

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/stats")
async def dashboard_stats(db: AsyncSession = Depends(get_db)) -> dict:
    # Counts
    asset_count_r = await db.execute(select(func.count()).select_from(Asset))
    asset_count: int = asset_count_r.scalar() or 0

    gen_count_r = await db.execute(select(func.count()).select_from(GenerationJob))
    gen_count: int = gen_count_r.scalar() or 0

    tmpl_count_r = await db.execute(select(func.count()).select_from(Template))
    tmpl_count: int = tmpl_count_r.scalar() or 0

    # Active brand kit name
    active_bk_r = await db.execute(
        select(BrandKit.name).where(BrandKit.is_active.is_(True)).limit(1)
    )
    active_brand_kit: str | None = active_bk_r.scalar_one_or_none()

    # Recent items: last 8 across assets + generation_jobs
    assets_q = select(
        Asset.id.label("id"),
        Asset.title.label("title"),
        literal("asset").label("type"),
        Asset.created_at.label("created_at"),
    )
    gens_q = select(
        GenerationJob.id.label("id"),
        GenerationJob.prompt.label("title"),
        literal("generation").label("type"),
        GenerationJob.created_at.label("created_at"),
    )

    combined = union_all(assets_q, gens_q).subquery()
    recent_r = await db.execute(
        select(combined).order_by(combined.c.created_at.desc()).limit(8)
    )
    rows = recent_r.fetchall()

    recent_items = [
        {
            "id": str(row.id),
            "title": row.title,
            "type": row.type,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]

    return {
        "asset_count": asset_count,
        "generation_count": gen_count,
        "template_count": tmpl_count,
        "active_brand_kit": active_brand_kit,
        "recent_items": recent_items,
    }
