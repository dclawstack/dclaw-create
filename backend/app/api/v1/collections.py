import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.asset_repo import CollectionRepository
from app.schemas.asset import CollectionCreate, CollectionResponse, CollectionUpdate
from app.services import asset_service

router = APIRouter(prefix="/api/v1/collections", tags=["collections"])


@router.get("/", response_model=list[CollectionResponse])
async def list_collections(
    db: AsyncSession = Depends(get_db),
) -> list[CollectionResponse]:
    items = await asset_service.list_collections(db)
    return [CollectionResponse.from_orm_with_count(c) for c in items]


@router.post("/", response_model=CollectionResponse, status_code=201)
async def create_collection(
    data: CollectionCreate, db: AsyncSession = Depends(get_db)
) -> CollectionResponse:
    collection = await asset_service.create_collection(data, db)
    return CollectionResponse.from_orm_with_count(collection)


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> CollectionResponse:
    collection = await asset_service.get_collection(collection_id, db)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return CollectionResponse.from_orm_with_count(collection)


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: uuid.UUID,
    data: CollectionUpdate,
    db: AsyncSession = Depends(get_db),
) -> CollectionResponse:
    collection = await asset_service.get_collection(collection_id, db)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    updated = await asset_service.update_collection(collection, data, db)
    return CollectionResponse.from_orm_with_count(updated)


@router.delete("/{collection_id}", status_code=204)
async def delete_collection(
    collection_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    collection = await asset_service.get_collection(collection_id, db)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    await asset_service.delete_collection(collection, db)


@router.post("/{collection_id}/assets/{asset_id}", status_code=204)
async def add_asset_to_collection(
    collection_id: uuid.UUID,
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = CollectionRepository(db)
    await repo.add_asset(collection_id, asset_id)


@router.delete("/{collection_id}/assets/{asset_id}", status_code=204)
async def remove_asset_from_collection(
    collection_id: uuid.UUID,
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = CollectionRepository(db)
    await repo.remove_asset(collection_id, asset_id)
