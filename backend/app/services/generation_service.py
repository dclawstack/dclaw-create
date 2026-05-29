import time
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generation_job import GenerationJob
from app.repositories.generation_job_repo import GenerationJobRepository
from app.repositories.llm_provider_repo import LLMProviderRepository
from app.services.brand_service import get_active_brand_kit, inject_brand_context
from app.services.llm_service import generate_text, generate_text_with_default

_SYSTEM_PROMPTS: dict[str, str] = {
    "text": "You are a creative copywriter. Generate engaging text content.",
    "image": "You are an image prompt engineer. Create a detailed, vivid image generation prompt.",
    "audio": "You are a sound designer. Describe audio/music for generation.",
    "video": "You are a video director. Create a detailed scene description for video generation.",
}


async def generate(
    job_type: str,
    prompt: str,
    db: AsyncSession,
    provider_id: uuid.UUID | None = None,
) -> GenerationJob:
    repo = GenerationJobRepository(db)

    system_prompt = _SYSTEM_PROMPTS.get(job_type, "You are a helpful AI assistant.")

    # Inject brand context if an active brand kit exists
    brand_kit = await get_active_brand_kit(db)
    if brand_kit:
        system_prompt = inject_brand_context(system_prompt, brand_kit)

    job = GenerationJob(
        job_type=job_type,
        prompt=prompt,
        system_prompt=system_prompt,
        provider_id=provider_id,
        status="processing",
    )
    job = await repo.create(job)

    start_ms = int(time.monotonic() * 1000)
    try:
        if provider_id is not None:
            llm_repo = LLMProviderRepository(db)
            provider = await llm_repo.get_by_id(provider_id)
            if provider is None:
                raise ValueError(f"Provider {provider_id} not found")
            result = await generate_text(system_prompt, prompt, provider)
        else:
            result = await generate_text_with_default(system_prompt, prompt, db)

        duration_ms = int(time.monotonic() * 1000) - start_ms

        job.result_text = result
        job.result_url = None
        job.status = "completed"
        job.duration_ms = duration_ms
    except Exception as exc:
        job.status = "failed"
        job.error_message = str(exc)

    await db.commit()
    await db.refresh(job)
    return job


async def get_generation_stats(db: AsyncSession) -> dict:
    repo = GenerationJobRepository(db)

    total = await repo.count()

    by_type: dict[str, int] = {}
    for jt in ("text", "image", "audio", "video"):
        items = await repo.list_by_type(jt, limit=1000, offset=0)
        by_type[jt] = len(items)

    recent_items = await repo.list_all(limit=5, offset=0)
    recent = recent_items[0] if isinstance(recent_items, tuple) else recent_items

    from app.schemas.generation_job import GenerationJobResponse

    return {
        "total": total,
        "by_type": by_type,
        "recent": [GenerationJobResponse.model_validate(j) for j in recent],
    }
