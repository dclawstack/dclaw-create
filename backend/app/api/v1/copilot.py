import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.copilot import CopilotSession
from app.repositories.copilot_repo import SessionRepository
from app.schemas.copilot import (
    ChatResponse,
    MessageCreate,
    MessageResponse,
    SessionCreate,
    SessionResponse,
)
from app.services import copilot_service

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)) -> list[SessionResponse]:
    repo = SessionRepository(db)
    sessions, _ = await repo.list_all(limit=100, offset=0)
    return [SessionResponse.from_orm_with_count(s) for s in sessions]


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    data: SessionCreate, db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    repo = SessionRepository(db)
    session = CopilotSession(title=data.title)
    session = await repo.create(session)
    return SessionResponse.from_orm_with_count(session)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    repo = SessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse.from_orm_with_count(session)


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    repo = SessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await repo.delete(session)


@router.post("/sessions/{session_id}/messages", response_model=ChatResponse, status_code=201)
async def send_message(
    session_id: uuid.UUID,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    try:
        user_msg, assistant_msg = await copilot_service.chat(session_id, data.content, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return ChatResponse(
        user_message=MessageResponse.model_validate(user_msg),
        assistant_message=MessageResponse.model_validate(assistant_msg),
    )
