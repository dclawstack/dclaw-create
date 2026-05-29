import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.utils import utc_now


collection_assets = Table(
    "collection_assets",
    Base.metadata,
    Column("collection_id", ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
    Column("asset_id", ForeignKey("assets.id", ondelete="CASCADE"), primary_key=True),
)


class Asset(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assets"

    title: Mapped[str] = mapped_column(String, nullable=False)
    asset_type: Mapped[str] = mapped_column(String, nullable=False)
    file_url: Mapped[str | None] = mapped_column(String, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String, nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    generation_job_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("generation_jobs.id", ondelete="SET NULL"), nullable=True
    )
    is_seeded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tags: Mapped[list["AssetTag"]] = relationship(
        "AssetTag",
        back_populates="asset",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class AssetTag(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "asset_tags"

    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), nullable=False
    )
    tag: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False, default="user")
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, nullable=False
    )

    asset: Mapped["Asset"] = relationship(
        "Asset", back_populates="tags", lazy="selectin"
    )


class Collection(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "collections"

    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_seeded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    assets: Mapped[list["Asset"]] = relationship(
        "Asset",
        secondary=collection_assets,
        lazy="selectin",
    )
