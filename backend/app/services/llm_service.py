import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.llm_provider import LLMProvider
from app.repositories.llm_provider_repo import LLMProviderRepository


async def generate_text(
    system_prompt: str, user_prompt: str, provider: LLMProvider,
) -> str:
    if provider.provider_type in ("openrouter", "openai"):
        return await _generate_openai_compatible(system_prompt, user_prompt, provider)
    elif provider.provider_type == "ollama":
        return await _generate_ollama(system_prompt, user_prompt, provider)
    else:
        raise ValueError(f"Unsupported provider type: {provider.provider_type}")


async def generate_text_with_default(
    system_prompt: str, user_prompt: str, db: AsyncSession,
) -> str:
    repo = LLMProviderRepository(db)
    provider = await repo.get_default()
    if provider is None:
        active = await repo.get_active()
        if not active:
            raise RuntimeError("No active LLM providers configured")
        provider = active[0]
    return await generate_text(system_prompt, user_prompt, provider)


async def _generate_openai_compatible(
    system_prompt: str, user_prompt: str, provider: LLMProvider,
) -> str:
    headers = {"Content-Type": "application/json"}
    if provider.api_key:
        headers["Authorization"] = f"Bearer {provider.api_key}"

    payload = {
        "model": provider.model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{provider.base_url}/chat/completions",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"]


async def _generate_ollama(
    system_prompt: str, user_prompt: str, provider: LLMProvider,
) -> str:
    payload = {
        "model": provider.model_name,
        "system": system_prompt,
        "prompt": user_prompt,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{provider.base_url}/api/generate",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
    return data["response"]
