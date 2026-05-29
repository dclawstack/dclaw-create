import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand_kit import BrandKit
from app.repositories.brand_kit_repo import BrandKitRepository
from app.schemas.brand_kit import BrandKitCreate, BrandKitUpdate

_COMPETITOR_NAMES = ["canva", "adobe", "figma"]


async def get_active_brand_kit(db: AsyncSession) -> BrandKit | None:
    return await BrandKitRepository(db).get_active()


def inject_brand_context(system_prompt: str, brand_kit: BrandKit) -> str:
    lines: list[str] = [f"\n\n## Brand Context: {brand_kit.name}"]

    primary_colors = [c for c in brand_kit.colors if isinstance(c, dict) and c.get("role") == "primary"]
    if primary_colors:
        color_strs = ", ".join(f"{c['name']} ({c['hex']})" for c in primary_colors)
        lines.append(f"Primary Colors: {color_strs}")

    if brand_kit.fonts:
        font_names = ", ".join(
            f["name"] for f in brand_kit.fonts if isinstance(f, dict) and "name" in f
        )
        lines.append(f"Fonts: {font_names}")

    if brand_kit.voice_guidelines:
        summary = brand_kit.voice_guidelines[:200]
        if len(brand_kit.voice_guidelines) > 200:
            summary += "..."
        lines.append(f"Voice: {summary}")

    return system_prompt + "\n".join(lines)


def check_violation(content: str, brand_kit: BrandKit) -> list[str]:
    lowered = content.lower()
    violations: list[str] = []
    for name in _COMPETITOR_NAMES:
        if name in lowered:
            violations.append(f"Content mentions competitor brand: '{name}'")
    return violations


async def list_brand_kits(db: AsyncSession) -> list[BrandKit]:
    repo = BrandKitRepository(db)
    items, _ = await repo.list_all(limit=100, offset=0)
    return items


async def create_brand_kit(data: BrandKitCreate, db: AsyncSession) -> BrandKit:
    repo = BrandKitRepository(db)
    kit = BrandKit(**data.model_dump())
    return await repo.create(kit)


async def get_brand_kit(kit_id: uuid.UUID, db: AsyncSession) -> BrandKit | None:
    return await BrandKitRepository(db).get_by_id(kit_id)


async def update_brand_kit(
    kit: BrandKit, data: BrandKitUpdate, db: AsyncSession
) -> BrandKit:
    return await BrandKitRepository(db).update(kit, data.model_dump(exclude_unset=True))


async def delete_brand_kit(kit: BrandKit, db: AsyncSession) -> None:
    await BrandKitRepository(db).delete(kit)


async def set_active_brand_kit(kit_id: uuid.UUID, db: AsyncSession) -> BrandKit:
    return await BrandKitRepository(db).set_active(kit_id)
