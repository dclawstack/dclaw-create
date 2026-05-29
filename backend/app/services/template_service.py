import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.template import Template
from app.repositories.template_repo import TemplateRepository
from app.schemas.template import TemplateCreate, TemplateRecommendation, TemplateResponse, TemplateUpdate


async def list_templates(
    db: AsyncSession,
    category: str | None = None,
    platform: str | None = None,
    featured: bool | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Template]:
    repo = TemplateRepository(db)
    if featured:
        return await repo.list_featured(limit)
    if category:
        return await repo.list_by_category(category, limit, offset)
    if platform:
        return await repo.list_by_platform(platform, limit, offset)
    items, _ = await repo.list_all(limit, offset)
    return items


async def create_template(data: TemplateCreate, db: AsyncSession) -> Template:
    repo = TemplateRepository(db)
    template = Template(**data.model_dump())
    return await repo.create(template)


async def get_template(template_id: uuid.UUID, db: AsyncSession) -> Template | None:
    return await TemplateRepository(db).get_by_id(template_id)


async def update_template(
    template: Template, data: TemplateUpdate, db: AsyncSession
) -> Template:
    return await TemplateRepository(db).update(template, data.model_dump(exclude_unset=True))


async def delete_template(template: Template, db: AsyncSession) -> None:
    await TemplateRepository(db).delete(template)


async def recommend_templates(prompt: str, db: AsyncSession) -> TemplateRecommendation:
    repo = TemplateRepository(db)
    templates, matched_on = await repo.recommend(prompt)
    return TemplateRecommendation(
        templates=[TemplateResponse.model_validate(t) for t in templates],
        matched_on=matched_on,
    )
