import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.asset_repo import AssetRepository
from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetTagCreate,
    AssetTagResponse,
    AssetUpdate,
)
from app.services import asset_service

router = APIRouter(prefix="/api/v1/assets", tags=["assets"])


@router.get("/", response_model=list[AssetResponse])
async def list_assets(
    asset_type: str | None = Query(None),
    search: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[AssetResponse]:
    items = await asset_service.list_assets(db, asset_type, search, limit, offset)
    return [AssetResponse.model_validate(a) for a in items]


@router.post("/", response_model=AssetResponse, status_code=201)
async def create_asset(
    data: AssetCreate, db: AsyncSession = Depends(get_db)
) -> AssetResponse:
    asset = await asset_service.create_asset(data, db)
    return AssetResponse.model_validate(asset)


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> AssetResponse:
    asset = await asset_service.get_asset(asset_id, db)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return AssetResponse.model_validate(asset)


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: uuid.UUID,
    data: AssetUpdate,
    db: AsyncSession = Depends(get_db),
) -> AssetResponse:
    asset = await asset_service.get_asset(asset_id, db)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    updated = await asset_service.update_asset(asset, data, db)
    return AssetResponse.model_validate(updated)


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    asset = await asset_service.get_asset(asset_id, db)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await asset_service.delete_asset(asset, db)


@router.post("/{asset_id}/tags", response_model=AssetTagResponse, status_code=201)
async def add_tag(
    asset_id: uuid.UUID,
    data: AssetTagCreate,
    db: AsyncSession = Depends(get_db),
) -> AssetTagResponse:
    asset = await asset_service.get_asset(asset_id, db)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    repo = AssetRepository(db)
    tag = await repo.add_tag(asset_id, data.tag, data.source, data.confidence)
    return AssetTagResponse.model_validate(tag)


@router.delete("/{asset_id}/tags/{tag_id}", status_code=204)
async def remove_tag(
    asset_id: uuid.UUID,
    tag_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = AssetRepository(db)
    await repo.remove_tag(tag_id)
