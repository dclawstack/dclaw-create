import uuid
from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.utils import utc_now


class CopilotSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "copilot_sessions"

    title: Mapped[str] = mapped_column(String, nullable=False, default="New Session")

    messages: Mapped[list["CopilotMessage"]] = relationship(
        "CopilotMessage",
        back_populates="session",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class CopilotMessage(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "copilot_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("copilot_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, nullable=False
    )

    session: Mapped["CopilotSession"] = relationship(
        "CopilotSession", back_populates="messages", lazy="selectin"
    )
