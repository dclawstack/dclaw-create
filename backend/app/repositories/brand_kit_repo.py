import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand_kit import BrandKit
from app.repositories.base_repo import BaseRepository


class BrandKitRepository(BaseRepository[BrandKit]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, BrandKit)

    async def get_active(self) -> BrandKit | None:
        result = await self.db.execute(
            select(BrandKit).where(BrandKit.is_active.is_(True))
        )
        return result.scalar_one_or_none()

    async def set_active(self, brand_kit_id: uuid.UUID) -> BrandKit:
        # Deactivate all
        await self.db.execute(
            update(BrandKit).values(is_active=False)
        )
        # Activate the target
        await self.db.execute(
            update(BrandKit)
            .where(BrandKit.id == brand_kit_id)
            .values(is_active=True)
        )
        await self.db.commit()
        kit = await self.get_by_id(brand_kit_id)
        return kit  # type: ignore[return-value]

    async def update(self, brand_kit: BrandKit, data: dict) -> BrandKit:
        for key, value in data.items():
            if value is not None:
                setattr(brand_kit, key, value)
        await self.db.commit()
        await self.db.refresh(brand_kit)
        return brand_kit
