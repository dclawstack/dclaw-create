import pytest
from httpx import AsyncClient

BASE = "/api/v1/generations"


def _job_payload(job_type: str = "text", prompt: str = "Write a headline") -> dict:
    return {"job_type": job_type, "prompt": prompt}


@pytest.mark.asyncio
async def test_create_text_generation(client: AsyncClient):
    r = await client.post(BASE + "/", json=_job_payload("text"))
    assert r.status_code == 201
    data = r.json()
    assert data["job_type"] == "text"
    assert data["prompt"] == "Write a headline"
    assert "id" in data
    assert "status" in data


@pytest.mark.asyncio
async def test_create_image_generation(client: AsyncClient):
    r = await client.post(BASE + "/", json=_job_payload("image", "A sunset over the mountains"))
    assert r.status_code == 201
    assert r.json()["job_type"] == "image"


@pytest.mark.asyncio
async def test_create_audio_generation(client: AsyncClient):
    r = await client.post(BASE + "/", json=_job_payload("audio", "Calm background music"))
    assert r.status_code == 201
    assert r.json()["job_type"] == "audio"


@pytest.mark.asyncio
async def test_create_video_generation(client: AsyncClient):
    r = await client.post(BASE + "/", json=_job_payload("video", "A product demo intro"))
    assert r.status_code == 201
    assert r.json()["job_type"] == "video"


@pytest.mark.asyncio
async def test_list_generations_empty(client: AsyncClient):
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    data = r.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_generations_returns_created(client: AsyncClient):
    await client.post(BASE + "/", json=_job_payload("text"))
    await client.post(BASE + "/", json=_job_payload("image"))

    r = await client.get(BASE + "/")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_filter_by_job_type(client: AsyncClient):
    await client.post(BASE + "/", json=_job_payload("text"))
    await client.post(BASE + "/", json=_job_payload("image"))

    r = await client.get(BASE + "/", params={"job_type": "text"})
    assert r.status_code == 200
    items = r.json()["items"]
    assert all(item["job_type"] == "text" for item in items)
    assert len(items) == 1


@pytest.mark.asyncio
async def test_list_filter_by_status(client: AsyncClient):
    await client.post(BASE + "/", json=_job_payload("text"))

    r = await client.get(BASE + "/", params={"status": "completed"})
    assert r.status_code == 200
    items = r.json()["items"]
    # All returned items must have the matching status
    for item in items:
        assert item["status"] == "completed"


@pytest.mark.asyncio
async def test_get_single_generation(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=_job_payload("text"))
    job_id = create_r.json()["id"]

    r = await client.get(f"{BASE}/{job_id}")
    assert r.status_code == 200
    assert r.json()["id"] == job_id


@pytest.mark.asyncio
async def test_get_nonexistent_generation_returns_404(client: AsyncClient):
    r = await client.get(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_invalid_job_type_still_creates(client: AsyncClient):
    # The service accepts any job_type string; there's no enum validation at the API layer
    r = await client.post(BASE + "/", json=_job_payload("unknown_type"))
    # Job is created (job_type is a free-form string)
    assert r.status_code == 201


@pytest.mark.asyncio
async def test_list_pagination_limit(client: AsyncClient):
    for i in range(5):
        await client.post(BASE + "/", json=_job_payload("text", f"Prompt {i}"))

    r = await client.get(BASE + "/", params={"limit": 3, "offset": 0})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 3
    assert data["total"] == 5


@pytest.mark.asyncio
async def test_list_pagination_offset(client: AsyncClient):
    for i in range(5):
        await client.post(BASE + "/", json=_job_payload("text", f"Prompt {i}"))

    r = await client.get(BASE + "/", params={"limit": 10, "offset": 3})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
