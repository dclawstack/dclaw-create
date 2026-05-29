from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services import seed_service

router = APIRouter(prefix="/api/v1/seed", tags=["seed"])


@router.get("/status")
async def seed_status(db: AsyncSession = Depends(get_db)) -> dict:
    return await seed_service.get_seed_status(db)


@router.post("/")
async def seed(db: AsyncSession = Depends(get_db)) -> dict:
    return await seed_service.seed_all(db)


@router.delete("/")
async def clear_seed(db: AsyncSession = Depends(get_db)) -> dict:
    return await seed_service.clear_seeded(db)
