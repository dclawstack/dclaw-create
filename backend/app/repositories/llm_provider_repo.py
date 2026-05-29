from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.llm_provider import LLMProvider
from app.repositories.base_repo import BaseRepository


class LLMProviderRepository(BaseRepository[LLMProvider]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, LLMProvider)

    async def get_default(self) -> LLMProvider | None:
        result = await self.db.execute(
            select(LLMProvider).where(
                LLMProvider.is_default == True,
                LLMProvider.is_active == True,
            )
        )
        return result.scalar_one_or_none()

    async def get_active(self) -> list[LLMProvider]:
        result = await self.db.execute(
            select(LLMProvider).where(LLMProvider.is_active == True)
        )
        return list(result.scalars().all())

    async def set_default(self, provider_id: UUID) -> LLMProvider | None:
        # Unset all defaults
        await self.db.execute(
            update(LLMProvider).values(is_default=False)
        )
        # Set the new default
        result = await self.db.execute(
            select(LLMProvider).where(LLMProvider.id == provider_id)
        )
        provider = result.scalar_one_or_none()
        if provider:
            provider.is_default = True
            await self.db.commit()
            await self.db.refresh(provider)
        return provider
