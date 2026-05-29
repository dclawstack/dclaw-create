from sqlalchemy import Boolean, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BrandKit(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "brand_kits"

    name: Mapped[str] = mapped_column(String, nullable=False)
    colors: Mapped[list] = mapped_column(JSON, default=[], nullable=False)
    fonts: Mapped[list] = mapped_column(JSON, default=[], nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    voice_guidelines: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_seeded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
