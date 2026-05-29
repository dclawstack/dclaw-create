import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset, AssetTag, Collection, collection_assets
from app.models.brand_kit import BrandKit
from app.models.template import Template

# ---------------------------------------------------------------------------
# Fixed-UUID seed data — re-seeding is always a no-op
# ---------------------------------------------------------------------------

SEED_ASSETS = [
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000001"),
        "title": "Summer Vibes Campaign",
        "asset_type": "image",
        "file_url": "https://placehold.co/800x600/EC4899/ffffff?text=Summer+Vibes",
        "thumbnail_url": "https://placehold.co/400x300/EC4899/ffffff?text=Summer+Vibes",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000002"),
        "title": "Product Launch Banner",
        "asset_type": "image",
        "file_url": "https://placehold.co/800x600/8B5CF6/ffffff?text=Product+Launch",
        "thumbnail_url": "https://placehold.co/400x300/8B5CF6/ffffff?text=Product+Launch",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000003"),
        "title": "Brand Hero Shot",
        "asset_type": "image",
        "file_url": "https://placehold.co/800x600/0EA5E9/ffffff?text=Brand+Hero",
        "thumbnail_url": "https://placehold.co/400x300/0EA5E9/ffffff?text=Brand+Hero",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000004"),
        "title": "Lifestyle Photo Set",
        "asset_type": "image",
        "file_url": "https://placehold.co/800x600/F59E0B/ffffff?text=Lifestyle",
        "thumbnail_url": "https://placehold.co/400x300/F59E0B/ffffff?text=Lifestyle",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000005"),
        "title": "Office Culture Photos",
        "asset_type": "image",
        "file_url": "https://placehold.co/800x600/10B981/ffffff?text=Office+Culture",
        "thumbnail_url": "https://placehold.co/400x300/10B981/ffffff?text=Office+Culture",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000006"),
        "title": "Product Demo Reel",
        "asset_type": "video",
        "file_url": "https://placehold.co/1280x720/8B5CF6/ffffff?text=Product+Demo",
        "thumbnail_url": "https://placehold.co/640x360/8B5CF6/ffffff?text=Product+Demo",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000007"),
        "title": "Brand Story Video",
        "asset_type": "video",
        "file_url": "https://placehold.co/1280x720/EC4899/ffffff?text=Brand+Story",
        "thumbnail_url": "https://placehold.co/640x360/EC4899/ffffff?text=Brand+Story",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000008"),
        "title": "Tutorial Walkthrough",
        "asset_type": "video",
        "file_url": "https://placehold.co/1280x720/0EA5E9/ffffff?text=Tutorial",
        "thumbnail_url": "https://placehold.co/640x360/0EA5E9/ffffff?text=Tutorial",
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000009"),
        "title": "Brand Jingle",
        "asset_type": "audio",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000010"),
        "title": "Podcast Intro",
        "asset_type": "audio",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000011"),
        "title": "Voiceover — Product CTA",
        "asset_type": "audio",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000012"),
        "title": "Q3 Campaign Copy",
        "asset_type": "text",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000013"),
        "title": "Instagram Caption Pack",
        "asset_type": "text",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000014"),
        "title": "Email Newsletter Draft",
        "asset_type": "text",
        "file_url": None,
        "thumbnail_url": None,
    },
    {
        "id": uuid.UUID("a0000001-0000-0000-0000-000000000015"),
        "title": "Product Description — Hero SKU",
        "asset_type": "text",
        "file_url": None,
        "thumbnail_url": None,
    },
]

_ASSET_IDS = [a["id"] for a in SEED_ASSETS]

SEED_COLLECTIONS = [
    {
        "id": uuid.UUID("c0000001-0000-0000-0000-000000000001"),
        "name": "Marketing Campaign",
        "description": "Core marketing campaign assets",
        "asset_ids": _ASSET_IDS[0:4],
    },
    {
        "id": uuid.UUID("c0000001-0000-0000-0000-000000000002"),
        "name": "Product Photography",
        "description": "Product and lifestyle photography",
        "asset_ids": _ASSET_IDS[4:8],
    },
    {
        "id": uuid.UUID("c0000001-0000-0000-0000-000000000003"),
        "name": "Social Media Content",
        "description": "Ready-to-post social media assets",
        "asset_ids": _ASSET_IDS[8:12],
    },
]

SEED_TEMPLATES = [
    # social_post x4
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000001"),
        "name": "Instagram Post",
        "category": "social_post",
        "platform": "instagram",
        "width": 1080,
        "height": 1080,
        "description": "Square post for Instagram feed",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/1080x1080/EC4899/ffffff?text=IG+Post",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000002"),
        "name": "Twitter Post",
        "category": "social_post",
        "platform": "twitter",
        "width": 1200,
        "height": 675,
        "description": "Landscape card for Twitter/X",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1200x675/1DA1F2/ffffff?text=Twitter+Post",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000003"),
        "name": "Facebook Post",
        "category": "social_post",
        "platform": "facebook",
        "width": 1200,
        "height": 630,
        "description": "Shared link preview for Facebook",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1200x630/1877F2/ffffff?text=FB+Post",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000004"),
        "name": "LinkedIn Post",
        "category": "social_post",
        "platform": "linkedin",
        "width": 1200,
        "height": 627,
        "description": "Professional LinkedIn article image",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1200x627/0A66C2/ffffff?text=LinkedIn+Post",
    },
    # ad x3
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000005"),
        "name": "Google Display Ad — Leaderboard",
        "category": "ad",
        "platform": "google",
        "width": 728,
        "height": 90,
        "description": "IAB standard leaderboard ad",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/728x90/F59E0B/ffffff?text=Leaderboard+Ad",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000006"),
        "name": "Google Display Ad — Rectangle",
        "category": "ad",
        "platform": "google",
        "width": 300,
        "height": 250,
        "description": "IAB standard medium rectangle ad",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/300x250/F59E0B/ffffff?text=Rectangle+Ad",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000007"),
        "name": "Facebook Ad",
        "category": "ad",
        "platform": "facebook",
        "width": 1080,
        "height": 1080,
        "description": "Square Facebook/Instagram paid ad",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/1080x1080/1877F2/ffffff?text=FB+Ad",
    },
    # thumbnail x3
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000008"),
        "name": "YouTube Thumbnail",
        "category": "thumbnail",
        "platform": "youtube",
        "width": 1280,
        "height": 720,
        "description": "High-impact YouTube video thumbnail",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/1280x720/FF0000/ffffff?text=YT+Thumbnail",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000009"),
        "name": "Podcast Cover Art",
        "category": "thumbnail",
        "platform": "spotify",
        "width": 3000,
        "height": 3000,
        "description": "Square podcast cover for Spotify & Apple",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/300x300/1DB954/ffffff?text=Podcast+Cover",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000010"),
        "name": "Blog Post Header",
        "category": "thumbnail",
        "platform": None,
        "width": 1600,
        "height": 840,
        "description": "Open Graph-ready blog header image",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1600x840/8B5CF6/ffffff?text=Blog+Header",
    },
    # banner x3
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000011"),
        "name": "Twitter Banner",
        "category": "banner",
        "platform": "twitter",
        "width": 1500,
        "height": 500,
        "description": "Profile header banner for Twitter/X",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1500x500/1DA1F2/ffffff?text=Twitter+Banner",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000012"),
        "name": "LinkedIn Banner",
        "category": "banner",
        "platform": "linkedin",
        "width": 1584,
        "height": 396,
        "description": "Profile background banner for LinkedIn",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1584x396/0A66C2/ffffff?text=LinkedIn+Banner",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000013"),
        "name": "YouTube Channel Art",
        "category": "banner",
        "platform": "youtube",
        "width": 2560,
        "height": 1440,
        "description": "Channel art for YouTube",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/2560x1440/FF0000/ffffff?text=YT+Channel+Art",
    },
    # story x3
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000014"),
        "name": "Instagram Story",
        "category": "story",
        "platform": "instagram",
        "width": 1080,
        "height": 1920,
        "description": "Vertical story for Instagram & Facebook",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/1080x1920/EC4899/ffffff?text=IG+Story",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000015"),
        "name": "TikTok Video Frame",
        "category": "story",
        "platform": "tiktok",
        "width": 1080,
        "height": 1920,
        "description": "Vertical frame template for TikTok content",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1080x1920/010101/ffffff?text=TikTok+Frame",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000016"),
        "name": "Snapchat Story",
        "category": "story",
        "platform": "snapchat",
        "width": 1080,
        "height": 1920,
        "description": "Snap story full-screen vertical template",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1080x1920/FFFC00/000000?text=Snap+Story",
    },
    # email x2
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000017"),
        "name": "Email Header",
        "category": "email",
        "platform": None,
        "width": 600,
        "height": 200,
        "description": "Standard email header banner (600px wide)",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/600x200/10B981/ffffff?text=Email+Header",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000018"),
        "name": "Email Newsletter",
        "category": "email",
        "platform": None,
        "width": 600,
        "height": 800,
        "description": "Full email newsletter layout",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/600x800/10B981/ffffff?text=Newsletter",
    },
    # additional featured
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000019"),
        "name": "Pinterest Pin",
        "category": "social_post",
        "platform": "pinterest",
        "width": 1000,
        "height": 1500,
        "description": "Tall vertical pin for Pinterest",
        "is_featured": True,
        "thumbnail_url": "https://placehold.co/1000x1500/E60023/ffffff?text=Pinterest+Pin",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000020"),
        "name": "Google Business Post",
        "category": "social_post",
        "platform": "google",
        "width": 1200,
        "height": 900,
        "description": "Google Business Profile update image",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/1200x900/4285F4/ffffff?text=GBP+Post",
    },
    {
        "id": uuid.UUID("a0000003-0000-0000-0000-000000000021"),
        "name": "Etsy Shop Banner",
        "category": "banner",
        "platform": "etsy",
        "width": 3360,
        "height": 840,
        "description": "Wide shop banner for Etsy storefronts",
        "is_featured": False,
        "thumbnail_url": "https://placehold.co/3360x840/F1641E/ffffff?text=Etsy+Banner",
    },
]

SEED_BRAND_KITS = [
    {
        "id": uuid.UUID("b0000001-0000-0000-0000-000000000001"),
        "name": "Acme Corp",
        "colors": [
            {"name": "Primary", "hex": "#EC4899", "role": "primary"},
            {"name": "Dark", "hex": "#0a0a0a", "role": "background"},
        ],
        "fonts": [{"name": "Inter", "role": "body"}],
        "voice_guidelines": "Bold, energetic, modern. Direct CTAs.",
        "is_active": True,
    },
    {
        "id": uuid.UUID("b0000001-0000-0000-0000-000000000002"),
        "name": "Luxe Brands",
        "colors": [
            {"name": "Gold", "hex": "#D4AF37", "role": "primary"},
            {"name": "Cream", "hex": "#FFFDD0", "role": "background"},
        ],
        "fonts": [{"name": "Playfair Display", "role": "heading"}],
        "voice_guidelines": "Sophisticated, understated, premium.",
        "is_active": False,
    },
]


# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------


async def seed_all(db: AsyncSession) -> dict:
    """Seed all demo data. Idempotent — uses fixed UUIDs so re-running is safe."""
    # Check via the first asset's fixed UUID
    existing = await db.get(Asset, SEED_ASSETS[0]["id"])
    if existing is not None:
        return {
            "message": "Already seeded — nothing to do.",
            "created": {"assets": 0, "collections": 0, "templates": 0, "brand_kits": 0},
        }

    # 1. Assets
    for a in SEED_ASSETS:
        db.add(Asset(
            id=a["id"],
            title=a["title"],
            asset_type=a["asset_type"],
            file_url=a["file_url"],
            thumbnail_url=a["thumbnail_url"],
            is_seeded=True,
        ))
    await db.flush()

    # 2. Collections + links
    for c in SEED_COLLECTIONS:
        coll = Collection(
            id=c["id"],
            name=c["name"],
            description=c["description"],
            is_seeded=True,
        )
        db.add(coll)
        await db.flush()
        for asset_id in c["asset_ids"]:
            await db.execute(
                collection_assets.insert().values(
                    collection_id=c["id"], asset_id=asset_id
                )
            )

    # 3. Templates
    for t in SEED_TEMPLATES:
        db.add(Template(
            id=t["id"],
            name=t["name"],
            category=t["category"],
            platform=t.get("platform"),
            width=t["width"],
            height=t["height"],
            description=t.get("description"),
            is_featured=t.get("is_featured", False),
            thumbnail_url=t.get("thumbnail_url"),
            template_data={},
            is_seeded=True,
        ))

    # 4. Brand kits
    for bk in SEED_BRAND_KITS:
        db.add(BrandKit(
            id=bk["id"],
            name=bk["name"],
            colors=bk["colors"],
            fonts=bk["fonts"],
            voice_guidelines=bk["voice_guidelines"],
            is_active=bk["is_active"],
            is_seeded=True,
        ))

    await db.commit()
    return {
        "message": "Demo data seeded successfully.",
        "created": {
            "assets": len(SEED_ASSETS),
            "collections": len(SEED_COLLECTIONS),
            "templates": len(SEED_TEMPLATES),
            "brand_kits": len(SEED_BRAND_KITS),
        },
    }


async def clear_seeded(db: AsyncSession) -> dict:
    """Delete ONLY records where is_seeded=True, in FK-safe order."""
    # 1. asset_tags for seeded assets
    seeded_asset_ids_q = select(Asset.id).where(Asset.is_seeded.is_(True))
    await db.execute(
        delete(AssetTag).where(AssetTag.asset_id.in_(seeded_asset_ids_q))
    )

    # 2. collection_assets rows for seeded collections OR seeded assets
    seeded_col_ids_q = select(Collection.id).where(Collection.is_seeded.is_(True))
    await db.execute(
        collection_assets.delete().where(
            collection_assets.c.collection_id.in_(seeded_col_ids_q)
            | collection_assets.c.asset_id.in_(seeded_asset_ids_q)
        )
    )

    # 3-6. Delete each entity and track counts
    r_assets = await db.execute(
        delete(Asset).where(Asset.is_seeded.is_(True)).returning(Asset.id)
    )
    r_collections = await db.execute(
        delete(Collection).where(Collection.is_seeded.is_(True)).returning(Collection.id)
    )
    r_templates = await db.execute(
        delete(Template).where(Template.is_seeded.is_(True)).returning(Template.id)
    )
    r_brand_kits = await db.execute(
        delete(BrandKit).where(BrandKit.is_seeded.is_(True)).returning(BrandKit.id)
    )

    await db.commit()
    return {
        "message": "Seeded demo data cleared.",
        "deleted": {
            "assets": len(r_assets.fetchall()),
            "collections": len(r_collections.fetchall()),
            "templates": len(r_templates.fetchall()),
            "brand_kits": len(r_brand_kits.fetchall()),
        },
    }


async def get_seed_status(db: AsyncSession) -> dict:
    """Return counts of seeded vs user-created records for each entity."""

    async def counts(model, seeded: bool) -> int:
        r = await db.execute(
            select(func.count()).select_from(model).where(
                model.is_seeded.is_(seeded)
            )
        )
        return r.scalar() or 0

    return {
        "assets": {
            "seeded": await counts(Asset, True),
            "user": await counts(Asset, False),
        },
        "collections": {
            "seeded": await counts(Collection, True),
            "user": await counts(Collection, False),
        },
        "templates": {
            "seeded": await counts(Template, True),
            "user": await counts(Template, False),
        },
        "brand_kits": {
            "seeded": await counts(BrandKit, True),
            "user": await counts(BrandKit, False),
        },
    }
