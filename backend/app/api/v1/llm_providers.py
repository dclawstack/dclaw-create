from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.llm_provider import LLMProvider
from app.repositories.llm_provider_repo import LLMProviderRepository
from app.schemas.llm_provider import (
    LLMProviderCreate,
    LLMProviderResponse,
    LLMProviderUpdate,
)
from app.services.llm_service import generate_text

router = APIRouter(prefix="/api/v1/llm-providers", tags=["llm-providers"])


@router.get("/", response_model=list[LLMProviderResponse])
async def list_providers(db: AsyncSession = Depends(get_db)):
    repo = LLMProviderRepository(db)
    providers, _ = await repo.list_all(limit=100, offset=0)
    return providers


@router.post("/", response_model=LLMProviderResponse, status_code=201)
async def create_provider(
    data: LLMProviderCreate, db: AsyncSession = Depends(get_db),
):
    provider = LLMProvider(
        name=data.name,
        display_name=data.display_name,
        provider_type=data.provider_type,
        api_key=data.api_key,
        base_url=data.base_url,
        model_name=data.model_name,
    )
    repo = LLMProviderRepository(db)
    return await repo.create(provider)


@router.get("/{provider_id}", response_model=LLMProviderResponse)
async def get_provider(provider_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = LLMProviderRepository(db)
    provider = await repo.get_by_id(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.put("/{provider_id}", response_model=LLMProviderResponse)
async def update_provider(
    provider_id: UUID,
    data: LLMProviderUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = LLMProviderRepository(db)
    provider = await repo.get_by_id(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)

    await db.commit()
    await db.refresh(provider)
    return provider


@router.delete("/{provider_id}", status_code=204)
async def delete_provider(provider_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = LLMProviderRepository(db)
    provider = await repo.get_by_id(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    await repo.delete(provider)


@router.post("/{provider_id}/set-default", response_model=LLMProviderResponse)
async def set_default_provider(
    provider_id: UUID, db: AsyncSession = Depends(get_db),
):
    repo = LLMProviderRepository(db)
    provider = await repo.set_default(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post("/{provider_id}/test-connection")
async def test_connection(provider_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = LLMProviderRepository(db)
    provider = await repo.get_by_id(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    try:
        result = await generate_text(
            system_prompt="You are a test assistant.",
            user_prompt="Say 'ok' in one word.",
            provider=provider,
        )
        return {"success": True, "message": result}
    except Exception as e:
        return {"success": False, "message": str(e)}
