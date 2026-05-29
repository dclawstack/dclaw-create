import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    title: str
    asset_type: str
    file_url: str | None = None
    thumbnail_url: str | None = None
    file_size: int | None = None
    mime_type: str | None = None
    metadata_json: dict[str, Any] | None = None
    generation_job_id: uuid.UUID | None = None


class AssetUpdate(BaseModel):
    title: str | None = None
    asset_type: str | None = None
    file_url: str | None = None
    thumbnail_url: str | None = None
    file_size: int | None = None
    mime_type: str | None = None
    metadata_json: dict[str, Any] | None = None
    generation_job_id: uuid.UUID | None = None


class AssetTagCreate(BaseModel):
    tag: str
    source: str = "user"
    confidence: float | None = None


class AssetTagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tag: str
    source: str
    confidence: float | None


class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    asset_type: str
    file_url: str | None
    thumbnail_url: str | None
    file_size: int | None
    mime_type: str | None
    metadata_json: dict[str, Any] | None
    generation_job_id: uuid.UUID | None
    is_seeded: bool
    created_at: datetime
    updated_at: datetime
    tags: list[AssetTagResponse] = []


class CollectionCreate(BaseModel):
    name: str
    description: str | None = None


class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    is_seeded: bool
    created_at: datetime
    asset_count: int = 0

    @classmethod
    def from_orm_with_count(cls, collection: object) -> "CollectionResponse":
        obj = cls.model_validate(collection)
        obj.asset_count = len(getattr(collection, "assets", []))
        return obj
