import pytest
from httpx import AsyncClient

DASHBOARD = "/api/v1/dashboard"
ASSETS = "/api/v1/assets"
GENERATIONS = "/api/v1/generations"
TEMPLATES = "/api/v1/templates"
SEED = "/api/v1/seed"


@pytest.mark.asyncio
async def test_dashboard_stats_returns_expected_keys(client: AsyncClient):
    r = await client.get(DASHBOARD + "/stats")
    assert r.status_code == 200
    data = r.json()
    assert "asset_count" in data
    assert "generation_count" in data
    assert "template_count" in data
    assert "active_brand_kit" in data
    assert "recent_items" in data


@pytest.mark.asyncio
async def test_dashboard_empty_state_all_counts_zero(client: AsyncClient):
    r = await client.get(DASHBOARD + "/stats")
    assert r.status_code == 200
    data = r.json()
    assert data["asset_count"] == 0
    assert data["generation_count"] == 0
    assert data["template_count"] == 0
    assert data["active_brand_kit"] is None
    assert data["recent_items"] == []


@pytest.mark.asyncio
async def test_dashboard_asset_count_reflects_created_assets(client: AsyncClient):
    await client.post(ASSETS + "/", json={"title": "A1", "asset_type": "image"})
    await client.post(ASSETS + "/", json={"title": "A2", "asset_type": "video"})

    r = await client.get(DASHBOARD + "/stats")
    assert r.json()["asset_count"] == 2


@pytest.mark.asyncio
async def test_dashboard_generation_count_reflects_jobs(client: AsyncClient):
    await client.post(GENERATIONS + "/", json={"job_type": "text", "prompt": "Hello"})
    await client.post(GENERATIONS + "/", json={"job_type": "image", "prompt": "Sunset"})
    await client.post(GENERATIONS + "/", json={"job_type": "audio", "prompt": "Music"})

    r = await client.get(DASHBOARD + "/stats")
    assert r.json()["generation_count"] == 3


@pytest.mark.asyncio
async def test_dashboard_template_count_reflects_templates(client: AsyncClient):
    await client.post(
        TEMPLATES + "/",
        json={"name": "T1", "category": "social_post", "width": 1080, "height": 1080},
    )

    r = await client.get(DASHBOARD + "/stats")
    assert r.json()["template_count"] == 1


@pytest.mark.asyncio
async def test_dashboard_recent_items_after_seed(client: AsyncClient):
    await client.post(SEED + "/")

    r = await client.get(DASHBOARD + "/stats")
    assert r.status_code == 200
    data = r.json()
    assert len(data["recent_items"]) > 0

    # Each recent item should have the expected keys
    for item in data["recent_items"]:
        assert "id" in item
        assert "title" in item
        assert "type" in item
        assert "created_at" in item
        assert item["type"] in ("asset", "generation")
