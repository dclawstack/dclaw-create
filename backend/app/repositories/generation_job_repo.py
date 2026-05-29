from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generation_job import GenerationJob
from app.repositories.base_repo import BaseRepository


class GenerationJobRepository(BaseRepository[GenerationJob]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, GenerationJob)

    async def list_by_type(
        self, job_type: str, limit: int = 20, offset: int = 0,
    ) -> list[GenerationJob]:
        result = await self.db.execute(
            select(GenerationJob)
            .where(GenerationJob.job_type == job_type)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_by_status(
        self, status: str, limit: int = 20, offset: int = 0,
    ) -> list[GenerationJob]:
        result = await self.db.execute(
            select(GenerationJob)
            .where(GenerationJob.status == status)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
