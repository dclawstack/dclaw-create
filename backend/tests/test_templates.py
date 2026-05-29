import pytest
from httpx import AsyncClient

BASE = "/api/v1/templates"

TEMPLATE_PAYLOAD = {
    "name": "Instagram Post",
    "category": "social_post",
    "platform": "instagram",
    "width": 1080,
    "height": 1080,
}


async def _create_template(client: AsyncClient, **overrides) -> dict:
    payload = {**TEMPLATE_PAYLOAD, **overrides}
    r = await client.post(BASE + "/", json=payload)
    assert r.status_code == 201
    return r.json()


@pytest.mark.asyncio
async def test_create_template(client: AsyncClient):
    r = await client.post(BASE + "/", json=TEMPLATE_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Instagram Post"
    assert data["width"] == 1080
    assert data["height"] == 1080
    assert "id" in data


@pytest.mark.asyncio
async def test_list_templates_empty(client: AsyncClient):
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_templates_returns_created(client: AsyncClient):
    await _create_template(client)
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.asyncio
async def test_get_template_by_id(client: AsyncClient):
    tmpl = await _create_template(client)
    r = await client.get(f"{BASE}/{tmpl['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == tmpl["id"]


@pytest.mark.asyncio
async def test_get_nonexistent_template_returns_404(client: AsyncClient):
    r = await client.get(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_template(client: AsyncClient):
    tmpl = await _create_template(client)
    r = await client.put(f"{BASE}/{tmpl['id']}", json={"name": "Updated Name"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_template(client: AsyncClient):
    tmpl = await _create_template(client)
    r = await client.delete(f"{BASE}/{tmpl['id']}")
    assert r.status_code == 204

    r2 = await client.get(f"{BASE}/{tmpl['id']}")
    assert r2.status_code == 404


@pytest.mark.asyncio
async def test_filter_by_category(client: AsyncClient):
    await _create_template(client, name="T1", category="social_post")
    await _create_template(client, name="T2", category="banner")

    r = await client.get(BASE + "/", params={"category": "social_post"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["category"] == "social_post"


@pytest.mark.asyncio
async def test_filter_by_platform(client: AsyncClient):
    await _create_template(client, name="T-ig", platform="instagram")
    await _create_template(client, name="T-tw", platform="twitter")

    r = await client.get(BASE + "/", params={"platform": "instagram"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["platform"] == "instagram"


@pytest.mark.asyncio
async def test_list_featured_templates(client: AsyncClient):
    await _create_template(client, name="Regular")
    featured = await _create_template(client, name="Featured")
    # Mark the second one as featured via update
    await client.put(f"{BASE}/{featured['id']}", json={"is_featured": True})

    r = await client.get(BASE + "/", params={"featured": True})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["is_featured"] is True


@pytest.mark.asyncio
async def test_recommend_endpoint(client: AsyncClient):
    await _create_template(client, name="Social Template", category="social_post")

    r = await client.post(BASE + "/recommend", json={"prompt": "I need a social post"})
    assert r.status_code == 200
    data = r.json()
    assert "templates" in data
    assert "matched_on" in data
    assert isinstance(data["templates"], list)


@pytest.mark.asyncio
async def test_create_template_missing_width_returns_422(client: AsyncClient):
    payload = {"name": "Bad Template", "category": "social_post", "height": 1080}
    r = await client.post(BASE + "/", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_template_missing_height_returns_422(client: AsyncClient):
    payload = {"name": "Bad Template", "category": "social_post", "width": 1080}
    r = await client.post(BASE + "/", json=payload)
    assert r.status_code == 422
