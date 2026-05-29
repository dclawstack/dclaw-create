import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BrandColor(BaseModel):
    name: str
    hex: str
    role: str  # "primary" | "secondary" | "accent" | "background" | "text"


class BrandFont(BaseModel):
    name: str
    url: str | None = None
    role: str  # "heading" | "body" | "caption"


class BrandKitCreate(BaseModel):
    name: str
    colors: list[BrandColor] = []
    fonts: list[BrandFont] = []
    logo_url: str | None = None
    voice_guidelines: str | None = None


class BrandKitUpdate(BaseModel):
    name: str | None = None
    colors: list[BrandColor] | None = None
    fonts: list[BrandFont] | None = None
    logo_url: str | None = None
    voice_guidelines: str | None = None
    is_active: bool | None = None


class BrandKitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    colors: list
    fonts: list
    logo_url: str | None
    voice_guidelines: str | None
    is_active: bool
    is_seeded: bool
    created_at: datetime
    updated_at: datetime


class BrandContextResponse(BaseModel):
    system_prompt_injection: str
