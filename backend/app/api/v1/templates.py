import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.template import (
    TemplateCreate,
    TemplateRecommendation,
    TemplateResponse,
    TemplateUpdate,
)
from app.services import template_service

router = APIRouter(prefix="/api/v1/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateResponse])
async def list_templates(
    category: str | None = Query(None),
    platform: str | None = Query(None),
    featured: bool | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[TemplateResponse]:
    items = await template_service.list_templates(db, category, platform, featured, limit, offset)
    return [TemplateResponse.model_validate(t) for t in items]


@router.post("/", response_model=TemplateResponse, status_code=201)
async def create_template(
    data: TemplateCreate, db: AsyncSession = Depends(get_db)
) -> TemplateResponse:
    template = await template_service.create_template(data, db)
    return TemplateResponse.model_validate(template)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> TemplateResponse:
    template = await template_service.get_template(template_id, db)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
) -> TemplateResponse:
    template = await template_service.get_template(template_id, db)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    updated = await template_service.update_template(template, data, db)
    return TemplateResponse.model_validate(updated)


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> None:
    template = await template_service.get_template(template_id, db)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await template_service.delete_template(template, db)


@router.post("/recommend", response_model=TemplateRecommendation)
async def recommend_templates(
    prompt: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
) -> TemplateRecommendation:
    return await template_service.recommend_templates(prompt, db)
