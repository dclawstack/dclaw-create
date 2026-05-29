import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class GenerationJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "generation_jobs"

    job_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("llm_providers.id", ondelete="SET NULL"), nullable=True,
    )
    result_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_url: Mapped[str | None] = mapped_column(String, nullable=True)
    result_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    provider = relationship("LLMProvider", lazy="selectin")
