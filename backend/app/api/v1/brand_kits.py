import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.brand_kit import (
    BrandContextResponse,
    BrandKitCreate,
    BrandKitResponse,
    BrandKitUpdate,
)
from app.services import brand_service

router = APIRouter(prefix="/api/v1/brand-kits", tags=["brand-kits"])


@router.get("/", response_model=list[BrandKitResponse])
async def list_brand_kits(
    db: AsyncSession = Depends(get_db),
) -> list[BrandKitResponse]:
    items = await brand_service.list_brand_kits(db)
    return [BrandKitResponse.model_validate(k) for k in items]


@router.post("/", response_model=BrandKitResponse, status_code=201)
async def create_brand_kit(
    data: BrandKitCreate, db: AsyncSession = Depends(get_db)
) -> BrandKitResponse:
    kit = await brand_service.create_brand_kit(data, db)
    return BrandKitResponse.model_validate(kit)


@router.get("/active", response_model=BrandKitResponse)
async def get_active_brand_kit(
    db: AsyncSession = Depends(get_db),
) -> BrandKitResponse:
    kit = await brand_service.get_active_brand_kit(db)
    if not kit:
        raise HTTPException(status_code=404, detail="No active brand kit")
    return BrandKitResponse.model_validate(kit)


@router.get("/{kit_id}", response_model=BrandKitResponse)
async def get_brand_kit(
    kit_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> BrandKitResponse:
    kit = await brand_service.get_brand_kit(kit_id, db)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    return BrandKitResponse.model_validate(kit)


@router.put("/{kit_id}", response_model=BrandKitResponse)
async def update_brand_kit(
    kit_id: uuid.UUID,
    data: BrandKitUpdate,
    db: AsyncSession = Depends(get_db),
) -> BrandKitResponse:
    kit = await brand_service.get_brand_kit(kit_id, db)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    updated = await brand_service.update_brand_kit(kit, data, db)
    return BrandKitResponse.model_validate(updated)


@router.delete("/{kit_id}", status_code=204)
async def delete_brand_kit(
    kit_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    kit = await brand_service.get_brand_kit(kit_id, db)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    await brand_service.delete_brand_kit(kit, db)


@router.post("/{kit_id}/set-active", response_model=BrandKitResponse)
async def set_active_brand_kit(
    kit_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> BrandKitResponse:
    kit = await brand_service.get_brand_kit(kit_id, db)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    activated = await brand_service.set_active_brand_kit(kit_id, db)
    return BrandKitResponse.model_validate(activated)


@router.post("/{kit_id}/check-violation", response_model=list[str])
async def check_violation(
    kit_id: uuid.UUID,
    content: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
) -> list[str]:
    kit = await brand_service.get_brand_kit(kit_id, db)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    return brand_service.check_violation(content, kit)
