import pytest
from httpx import AsyncClient

BASE = "/api/v1/brand-kits"

BRAND_KIT_PAYLOAD = {
    "name": "Acme Brand",
    "colors": [{"name": "Primary Blue", "hex": "#0055FF", "role": "primary"}],
    "fonts": [{"name": "Inter", "role": "heading"}],
    "voice_guidelines": "Professional and concise.",
}


async def _create_kit(client: AsyncClient, **overrides) -> dict:
    payload = {**BRAND_KIT_PAYLOAD, **overrides}
    r = await client.post(BASE + "/", json=payload)
    assert r.status_code == 201
    return r.json()


@pytest.mark.asyncio
async def test_create_brand_kit(client: AsyncClient):
    r = await client.post(BASE + "/", json=BRAND_KIT_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Acme Brand"
    assert "id" in data
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_list_brand_kits_empty(client: AsyncClient):
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_brand_kits_returns_created(client: AsyncClient):
    await _create_kit(client)
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.asyncio
async def test_get_brand_kit_by_id(client: AsyncClient):
    kit = await _create_kit(client)
    r = await client.get(f"{BASE}/{kit['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == kit["id"]


@pytest.mark.asyncio
async def test_get_nonexistent_brand_kit_returns_404(client: AsyncClient):
    r = await client.get(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_brand_kit(client: AsyncClient):
    kit = await _create_kit(client)
    r = await client.put(f"{BASE}/{kit['id']}", json={"name": "Updated Brand"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated Brand"


@pytest.mark.asyncio
async def test_delete_brand_kit(client: AsyncClient):
    kit = await _create_kit(client)
    r = await client.delete(f"{BASE}/{kit['id']}")
    assert r.status_code == 204

    r2 = await client.get(f"{BASE}/{kit['id']}")
    assert r2.status_code == 404


@pytest.mark.asyncio
async def test_set_active_brand_kit(client: AsyncClient):
    kit = await _create_kit(client)
    r = await client.post(f"{BASE}/{kit['id']}/set-active")
    assert r.status_code == 200
    assert r.json()["is_active"] is True


@pytest.mark.asyncio
async def test_only_one_active_brand_kit(client: AsyncClient):
    kit1 = await _create_kit(client, name="Brand A")
    kit2 = await _create_kit(client, name="Brand B")

    await client.post(f"{BASE}/{kit1['id']}/set-active")
    await client.post(f"{BASE}/{kit2['id']}/set-active")

    r1 = await client.get(f"{BASE}/{kit1['id']}")
    r2 = await client.get(f"{BASE}/{kit2['id']}")

    assert r1.json()["is_active"] is False, "First kit should be deactivated"
    assert r2.json()["is_active"] is True, "Second kit should be active"


@pytest.mark.asyncio
async def test_get_active_brand_kit(client: AsyncClient):
    kit = await _create_kit(client)
    await client.post(f"{BASE}/{kit['id']}/set-active")

    r = await client.get(f"{BASE}/active")
    assert r.status_code == 200
    assert r.json()["id"] == kit["id"]
    assert r.json()["is_active"] is True


@pytest.mark.asyncio
async def test_get_active_brand_kit_no_active_returns_404(client: AsyncClient):
    await _create_kit(client)  # create but don't activate
    r = await client.get(f"{BASE}/active")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_check_violation_stub(client: AsyncClient):
    kit = await _create_kit(client)
    r = await client.post(
        f"{BASE}/{kit['id']}/check-violation",
        json={"content": "Some brand content to check"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
