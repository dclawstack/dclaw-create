import uuid

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.copilot import CopilotMessage
from app.repositories.copilot_repo import MessageRepository, SessionRepository
from app.services.llm_service import generate_text_with_default

logger = structlog.get_logger(__name__)

_SYSTEM_PROMPT = (
    "You are a creative director AI for DClaw Create, an AI content creation studio. "
    "You help users create text, images, audio, and video content. "
    "Suggest creative directions, help write prompts for generation, and provide creative feedback. "
    "Be concise, practical, and inspiring."
)

_FALLBACK_RESPONSE = (
    "I'm your creative director! To enable AI responses, configure an LLM provider in "
    "Settings → AI Providers. In the meantime, I can tell you that for your request, "
    "I'd suggest: focusing on strong visual contrast, using brand-consistent colors, "
    "and keeping the message clear and direct."
)


async def chat(
    session_id: uuid.UUID, user_content: str, db: AsyncSession
) -> tuple[CopilotMessage, CopilotMessage]:
    session_repo = SessionRepository(db)
    message_repo = MessageRepository(db)

    session = await session_repo.get_by_id(session_id)
    if session is None:
        raise ValueError(f"Session {session_id} not found")

    history = await message_repo.get_by_session(session_id)

    user_msg = CopilotMessage(session_id=session_id, role="user", content=user_content)
    user_msg = await message_repo.create(user_msg)

    history_text = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in history
    )
    user_prompt = (
        f"Conversation history:\n{history_text}\n\nUSER: {user_content}"
        if history_text
        else f"USER: {user_content}"
    )

    try:
        assistant_content = await generate_text_with_default(_SYSTEM_PROMPT, user_prompt, db)
    except RuntimeError:
        logger.info("copilot.no_provider_configured", session_id=str(session_id))
        assistant_content = _FALLBACK_RESPONSE

    assistant_msg = CopilotMessage(
        session_id=session_id, role="assistant", content=assistant_content
    )
    assistant_msg = await message_repo.create(assistant_msg)

    return user_msg, assistant_msg
