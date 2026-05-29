import uuid

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset, AssetTag, Collection, collection_assets
from app.repositories.base_repo import BaseRepository


_AUTO_TAG_MAP: dict[str, list[str]] = {
    "image": ["visual", "graphic", "photo"],
    "video": ["motion", "clip", "footage"],
    "audio": ["sound", "track", "audio"],
    "text": ["copy", "written", "content"],
    "template": ["template", "layout", "design"],
}


class AssetRepository(BaseRepository[Asset]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Asset)

    async def list_by_type(
        self, asset_type: str, limit: int = 20, offset: int = 0
    ) -> list[Asset]:
        result = await self.db.execute(
            select(Asset)
            .where(Asset.asset_type == asset_type)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def search(
        self,
        query: str,
        asset_type: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Asset]:
        stmt = (
            select(Asset)
            .outerjoin(AssetTag, AssetTag.asset_id == Asset.id)
            .where(
                or_(
                    Asset.title.ilike(f"%{query}%"),
                    AssetTag.tag.ilike(f"%{query}%"),
                )
            )
            .distinct()
        )
        if asset_type:
            stmt = stmt.where(Asset.asset_type == asset_type)
        stmt = stmt.limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def add_tag(
        self,
        asset_id: uuid.UUID,
        tag: str,
        source: str,
        confidence: float | None,
    ) -> AssetTag:
        asset_tag = AssetTag(
            asset_id=asset_id, tag=tag, source=source, confidence=confidence
        )
        self.db.add(asset_tag)
        await self.db.commit()
        await self.db.refresh(asset_tag)
        return asset_tag

    async def remove_tag(self, tag_id: uuid.UUID) -> None:
        result = await self.db.execute(
            select(AssetTag).where(AssetTag.id == tag_id)
        )
        tag = result.scalar_one_or_none()
        if tag:
            await self.db.delete(tag)
            await self.db.commit()

    async def add_auto_tags(self, asset_id: uuid.UUID) -> list[AssetTag]:
        asset = await self.get_by_id(asset_id)
        if asset is None:
            return []
        tag_names = _AUTO_TAG_MAP.get(asset.asset_type, ["content", "media", "asset"])
        tags: list[AssetTag] = []
        for name in tag_names:
            t = await self.add_tag(asset_id, name, source="ai", confidence=0.8)
            tags.append(t)
        return tags

    async def update(self, asset: Asset, data: dict) -> Asset:
        for key, value in data.items():
            if value is not None:
                setattr(asset, key, value)
        await self.db.commit()
        await self.db.refresh(asset)
        return asset


class CollectionRepository(BaseRepository[Collection]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Collection)

    async def get_with_assets(self, collection_id: uuid.UUID) -> Collection | None:
        return await self.get_by_id(collection_id)

    async def add_asset(self, collection_id: uuid.UUID, asset_id: uuid.UUID) -> None:
        await self.db.execute(
            collection_assets.insert().values(
                collection_id=collection_id, asset_id=asset_id
            )
        )
        await self.db.commit()

    async def remove_asset(self, collection_id: uuid.UUID, asset_id: uuid.UUID) -> None:
        await self.db.execute(
            delete(collection_assets).where(
                collection_assets.c.collection_id == collection_id,
                collection_assets.c.asset_id == asset_id,
            )
        )
        await self.db.commit()

    async def update(self, collection: Collection, data: dict) -> Collection:
        for key, value in data.items():
            if value is not None:
                setattr(collection, key, value)
        await self.db.commit()
        await self.db.refresh(collection)
        return collection
