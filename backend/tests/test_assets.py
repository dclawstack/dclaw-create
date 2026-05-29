import pytest
from httpx import AsyncClient

ASSETS = "/api/v1/assets"
COLLECTIONS = "/api/v1/collections"

ASSET_PAYLOAD = {
    "title": "Test Image",
    "asset_type": "image",
    "file_url": "https://example.com/image.png",
    "mime_type": "image/png",
}


async def _create_asset(client: AsyncClient, **overrides) -> dict:
    payload = {**ASSET_PAYLOAD, **overrides}
    r = await client.post(ASSETS + "/", json=payload)
    assert r.status_code == 201
    return r.json()


@pytest.mark.asyncio
async def test_create_asset(client: AsyncClient):
    r = await client.post(ASSETS + "/", json=ASSET_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Test Image"
    assert data["asset_type"] == "image"
    assert "id" in data
    assert data["tags"] == []


@pytest.mark.asyncio
async def test_list_assets_empty(client: AsyncClient):
    r = await client.get(ASSETS + "/")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_assets_returns_created(client: AsyncClient):
    await _create_asset(client)
    r = await client.get(ASSETS + "/")
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.asyncio
async def test_get_asset_by_id(client: AsyncClient):
    asset = await _create_asset(client)
    r = await client.get(f"{ASSETS}/{asset['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == asset["id"]


@pytest.mark.asyncio
async def test_get_nonexistent_asset_returns_404(client: AsyncClient):
    r = await client.get(f"{ASSETS}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_asset(client: AsyncClient):
    asset = await _create_asset(client)
    r = await client.put(f"{ASSETS}/{asset['id']}", json={"title": "Updated Title"})
    assert r.status_code == 200
    assert r.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_delete_asset(client: AsyncClient):
    asset = await _create_asset(client)
    r = await client.delete(f"{ASSETS}/{asset['id']}")
    assert r.status_code == 204

    r2 = await client.get(f"{ASSETS}/{asset['id']}")
    assert r2.status_code == 404, "Deleted asset should return 404"


@pytest.mark.asyncio
async def test_list_filter_by_asset_type(client: AsyncClient):
    await _create_asset(client, title="Img1", asset_type="image")
    await _create_asset(client, title="Vid1", asset_type="video")

    r = await client.get(ASSETS + "/", params={"asset_type": "image"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["asset_type"] == "image"


@pytest.mark.asyncio
async def test_add_tag_to_asset(client: AsyncClient):
    asset = await _create_asset(client)
    r = await client.post(
        f"{ASSETS}/{asset['id']}/tags",
        json={"tag": "landscape", "source": "user"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["tag"] == "landscape"
    assert data["source"] == "user"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_tags_for_asset(client: AsyncClient):
    asset = await _create_asset(client)
    await client.post(
        f"{ASSETS}/{asset['id']}/tags", json={"tag": "nature", "source": "user"}
    )
    await client.post(
        f"{ASSETS}/{asset['id']}/tags", json={"tag": "sunset", "source": "user"}
    )

    r = await client.get(f"{ASSETS}/{asset['id']}")
    assert r.status_code == 200
    tags = r.json()["tags"]
    assert len(tags) == 2
    tag_names = {t["tag"] for t in tags}
    assert "nature" in tag_names
    assert "sunset" in tag_names


@pytest.mark.asyncio
async def test_remove_tag_from_asset(client: AsyncClient):
    asset = await _create_asset(client)
    tag_r = await client.post(
        f"{ASSETS}/{asset['id']}/tags", json={"tag": "to-remove", "source": "user"}
    )
    tag_id = tag_r.json()["id"]

    r = await client.delete(f"{ASSETS}/{asset['id']}/tags/{tag_id}")
    assert r.status_code == 204

    asset_r = await client.get(f"{ASSETS}/{asset['id']}")
    remaining_tags = asset_r.json()["tags"]
    assert all(t["id"] != tag_id for t in remaining_tags)


@pytest.mark.asyncio
async def test_create_collection(client: AsyncClient):
    r = await client.post(COLLECTIONS + "/", json={"name": "My Collection"})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "My Collection"
    assert data["asset_count"] == 0


@pytest.mark.asyncio
async def test_add_asset_to_collection(client: AsyncClient):
    collection = (
        await client.post(COLLECTIONS + "/", json={"name": "Gallery"})
    ).json()
    asset = await _create_asset(client)

    r = await client.post(
        f"{COLLECTIONS}/{collection['id']}/assets/{asset['id']}"
    )
    assert r.status_code == 204

    r2 = await client.get(f"{COLLECTIONS}/{collection['id']}")
    assert r2.json()["asset_count"] == 1


@pytest.mark.asyncio
async def test_remove_asset_from_collection(client: AsyncClient):
    collection = (
        await client.post(COLLECTIONS + "/", json={"name": "Gallery"})
    ).json()
    asset = await _create_asset(client)
    await client.post(f"{COLLECTIONS}/{collection['id']}/assets/{asset['id']}")

    r = await client.delete(
        f"{COLLECTIONS}/{collection['id']}/assets/{asset['id']}"
    )
    assert r.status_code == 204

    r2 = await client.get(f"{COLLECTIONS}/{collection['id']}")
    assert r2.json()["asset_count"] == 0


@pytest.mark.asyncio
async def test_list_assets_pagination_limit(client: AsyncClient):
    for i in range(6):
        await _create_asset(client, title=f"Asset {i}")

    r = await client.get(ASSETS + "/", params={"limit": 4, "offset": 0})
    assert r.status_code == 200
    assert len(r.json()) == 4


@pytest.mark.asyncio
async def test_list_assets_pagination_offset(client: AsyncClient):
    for i in range(6):
        await _create_asset(client, title=f"Asset {i}")

    r = await client.get(ASSETS + "/", params={"limit": 10, "offset": 4})
    assert r.status_code == 200
    assert len(r.json()) == 2
