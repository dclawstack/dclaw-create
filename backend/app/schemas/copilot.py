import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):
    title: str = "New Session"


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    @classmethod
    def from_orm_with_count(cls, session: object) -> "SessionResponse":
        obj = cls.model_validate(session)
        obj.message_count = len(getattr(session, "messages", []))
        return obj


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
