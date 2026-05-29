import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class TemplateCreate(BaseModel):
    name: str
    description: str | None = None
    category: str
    platform: str | None = None
    width: int
    height: int
    thumbnail_url: str | None = None
    template_data: dict[str, Any] = {}


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    platform: str | None = None
    width: int | None = None
    height: int | None = None
    thumbnail_url: str | None = None
    template_data: dict[str, Any] | None = None
    is_featured: bool | None = None


class TemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    category: str
    platform: str | None
    width: int
    height: int
    thumbnail_url: str | None
    template_data: dict[str, Any]
    is_featured: bool
    is_seeded: bool
    created_at: datetime
    updated_at: datetime


class TemplateRecommendation(BaseModel):
    templates: list[TemplateResponse]
    matched_on: str
