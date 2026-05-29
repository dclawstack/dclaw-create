import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GenerationJobCreate(BaseModel):
    job_type: str
    prompt: str
    system_prompt: str | None = None
    provider_id: uuid.UUID | None = None


class GenerationJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_type: str
    status: str
    prompt: str
    system_prompt: str | None
    provider_id: uuid.UUID | None
    result_text: str | None
    result_url: str | None
    result_metadata: dict | None
    error_message: str | None
    duration_ms: int | None
    created_at: datetime
    updated_at: datetime


class GenerationJobList(BaseModel):
    items: list[GenerationJobResponse]
    total: int
