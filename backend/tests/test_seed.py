import pytest
from httpx import AsyncClient

SEED = "/api/v1/seed"
ASSETS = "/api/v1/assets"


@pytest.mark.asyncio
async def test_seed_creates_data(client: AsyncClient):
    r = await client.post(SEED + "/")
    assert r.status_code == 200
    data = r.json()
    assert "created" in data
    created = data["created"]
    assert created["assets"] > 0
    assert created["templates"] > 0


@pytest.mark.asyncio
async def test_seed_is_idempotent(client: AsyncClient):
    r1 = await client.post(SEED + "/")
    assert r1.status_code == 200

    r2 = await client.post(SEED + "/")
    assert r2.status_code == 200
    data2 = r2.json()
    # Second run should not error; created counts should be 0 (nothing new)
    assert data2["created"]["assets"] == 0
    assert data2["created"]["templates"] == 0


@pytest.mark.asyncio
async def test_seed_status_returns_counts(client: AsyncClient):
    r = await client.get(SEED + "/status")
    assert r.status_code == 200
    data = r.json()
    assert "assets" in data
    assert "templates" in data
    assert "seeded" in data["assets"]
    assert "user" in data["assets"]


@pytest.mark.asyncio
async def test_seed_status_reflects_seeded_data(client: AsyncClient):
    await client.post(SEED + "/")

    r = await client.get(SEED + "/status")
    assert r.status_code == 200
    data = r.json()
    assert data["assets"]["seeded"] > 0
    assert data["templates"]["seeded"] > 0


@pytest.mark.asyncio
async def test_delete_seed_returns_counts(client: AsyncClient):
    await client.post(SEED + "/")

    r = await client.delete(SEED + "/")
    assert r.status_code == 200
    data = r.json()
    assert "deleted" in data


@pytest.mark.asyncio
async def test_delete_seed_zeroes_out_seeded_counts(client: AsyncClient):
    await client.post(SEED + "/")
    await client.delete(SEED + "/")

    r = await client.get(SEED + "/status")
    assert r.status_code == 200
    data = r.json()
    assert data["assets"]["seeded"] == 0
    assert data["templates"]["seeded"] == 0


@pytest.mark.asyncio
async def test_user_asset_survives_seed_delete(client: AsyncClient):
    # Create a user asset before seeding
    create_r = await client.post(
        ASSETS + "/",
        json={"title": "User Asset", "asset_type": "image"},
    )
    assert create_r.status_code == 201
    user_asset_id = create_r.json()["id"]

    await client.post(SEED + "/")
    await client.delete(SEED + "/")

    # User-created asset should still exist
    r = await client.get(f"{ASSETS}/{user_asset_id}")
    assert r.status_code == 200, "User asset must survive seed deletion"


@pytest.mark.asyncio
async def test_seed_then_delete_does_not_remove_user_templates(client: AsyncClient):
    # Create a user template
    tmpl_r = await client.post(
        "/api/v1/templates/",
        json={"name": "User Template", "category": "banner", "width": 800, "height": 600},
    )
    assert tmpl_r.status_code == 201
    tmpl_id = tmpl_r.json()["id"]

    await client.post(SEED + "/")
    await client.delete(SEED + "/")

    r = await client.get(f"/api/v1/templates/{tmpl_id}")
    assert r.status_code == 200, "User template must survive seed deletion"
