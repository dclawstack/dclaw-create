import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset, AssetTag, Collection
from app.repositories.asset_repo import AssetRepository, CollectionRepository
from app.schemas.asset import AssetCreate, AssetUpdate, CollectionCreate, CollectionUpdate


async def list_assets(
    db: AsyncSession,
    asset_type: str | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Asset]:
    repo = AssetRepository(db)
    if search:
        return await repo.search(search, asset_type, limit, offset)
    if asset_type:
        return await repo.list_by_type(asset_type, limit, offset)
    items, _ = await repo.list_all(limit, offset)
    return items


async def create_asset(data: AssetCreate, db: AsyncSession) -> Asset:
    repo = AssetRepository(db)
    asset = Asset(**data.model_dump())
    return await repo.create(asset)


async def get_asset(asset_id: uuid.UUID, db: AsyncSession) -> Asset | None:
    return await AssetRepository(db).get_by_id(asset_id)


async def update_asset(
    asset: Asset, data: AssetUpdate, db: AsyncSession
) -> Asset:
    repo = AssetRepository(db)
    return await repo.update(asset, data.model_dump(exclude_unset=True))


async def delete_asset(asset: Asset, db: AsyncSession) -> None:
    await AssetRepository(db).delete(asset)


async def auto_tag_asset(asset_id: uuid.UUID, db: AsyncSession) -> list[AssetTag]:
    return await AssetRepository(db).add_auto_tags(asset_id)


async def list_collections(db: AsyncSession) -> list[Collection]:
    repo = CollectionRepository(db)
    items, _ = await repo.list_all(limit=100, offset=0)
    return items


async def create_collection(data: CollectionCreate, db: AsyncSession) -> Collection:
    repo = CollectionRepository(db)
    collection = Collection(**data.model_dump())
    return await repo.create(collection)


async def get_collection(collection_id: uuid.UUID, db: AsyncSession) -> Collection | None:
    return await CollectionRepository(db).get_with_assets(collection_id)


async def update_collection(
    collection: Collection, data: CollectionUpdate, db: AsyncSession
) -> Collection:
    repo = CollectionRepository(db)
    return await repo.update(collection, data.model_dump(exclude_unset=True))


async def delete_collection(collection: Collection, db: AsyncSession) -> None:
    await CollectionRepository(db).delete(collection)
