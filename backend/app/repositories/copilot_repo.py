import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.copilot import CopilotMessage, CopilotSession
from app.repositories.base_repo import BaseRepository


class SessionRepository(BaseRepository[CopilotSession]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, CopilotSession)

    async def get_by_id(self, session_id: uuid.UUID) -> CopilotSession | None:
        result = await self.db.execute(
            select(CopilotSession).where(CopilotSession.id == session_id)
        )
        return result.scalar_one_or_none()


class MessageRepository(BaseRepository[CopilotMessage]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, CopilotMessage)

    async def get_by_session(self, session_id: uuid.UUID) -> list[CopilotMessage]:
        result = await self.db.execute(
            select(CopilotMessage)
            .where(CopilotMessage.session_id == session_id)
            .order_by(CopilotMessage.created_at)
        )
        return list(result.scalars().all())
