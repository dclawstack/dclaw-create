from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.template import Template
from app.repositories.base_repo import BaseRepository

_PLATFORM_KEYWORDS: dict[str, str] = {
    "instagram": "instagram",
    "twitter": "twitter",
    "facebook": "facebook",
    "youtube": "youtube",
    "tiktok": "tiktok",
    "linkedin": "linkedin",
}

_CATEGORY_KEYWORDS: dict[str, str] = {
    "social": "social_post",
    "post": "social_post",
    "ad": "ad",
    "advertisement": "ad",
    "thumbnail": "thumbnail",
    "banner": "banner",
    "story": "story",
    "email": "email",
}


class TemplateRepository(BaseRepository[Template]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Template)

    async def list_by_category(
        self, category: str, limit: int = 20, offset: int = 0
    ) -> list[Template]:
        result = await self.db.execute(
            select(Template)
            .where(Template.category == category)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_by_platform(
        self, platform: str, limit: int = 20, offset: int = 0
    ) -> list[Template]:
        result = await self.db.execute(
            select(Template)
            .where(Template.platform == platform)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_featured(self, limit: int = 20) -> list[Template]:
        result = await self.db.execute(
            select(Template).where(Template.is_featured.is_(True)).limit(limit)
        )
        return list(result.scalars().all())

    async def recommend(self, prompt: str, limit: int = 5) -> tuple[list[Template], str]:
        lowered = prompt.lower()

        matched_platform: str | None = None
        for keyword, platform in _PLATFORM_KEYWORDS.items():
            if keyword in lowered:
                matched_platform = platform
                break

        matched_category: str | None = None
        for keyword, category in _CATEGORY_KEYWORDS.items():
            if keyword in lowered:
                matched_category = category
                break

        if matched_platform:
            stmt = select(Template).where(Template.platform == matched_platform).limit(limit)
            result = await self.db.execute(stmt)
            templates = list(result.scalars().all())
            if templates:
                return templates, f"platform:{matched_platform}"

        if matched_category:
            stmt = select(Template).where(Template.category == matched_category).limit(limit)
            result = await self.db.execute(stmt)
            templates = list(result.scalars().all())
            if templates:
                return templates, f"category:{matched_category}"

        featured = await self.list_featured(limit)
        return featured, "featured"

    async def update(self, template: Template, data: dict) -> Template:
        for key, value in data.items():
            if value is not None:
                setattr(template, key, value)
        await self.db.commit()
        await self.db.refresh(template)
        return template
