import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class LLMProviderCreate(BaseModel):
    name: str
    display_name: str
    provider_type: str
    api_key: str | None = None
    base_url: str
    model_name: str


class LLMProviderUpdate(BaseModel):
    name: str | None = None
    display_name: str | None = None
    provider_type: str | None = None
    api_key: str | None = None
    base_url: str | None = None
    model_name: str | None = None
    is_active: bool | None = None
    is_default: bool | None = None


class LLMProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    display_name: str
    provider_type: str
    api_key: str | None
    base_url: str
    model_name: str
    is_active: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime

    @field_validator("api_key", mode="before")
    @classmethod
    def mask_api_key(cls, v: str | None) -> str | None:
        if v is None:
            return None
        if len(v) <= 8:
            return "****"
        return f"{v[:4]}***{v[-4:]}"
