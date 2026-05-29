import pytest
from httpx import AsyncClient

BASE = "/api/v1/llm-providers"

PROVIDER_PAYLOAD = {
    "name": "openai-test",
    "display_name": "OpenAI Test",
    "provider_type": "openai",
    "api_key": "sk-test1234567890abcdef",
    "base_url": "https://api.openai.com/v1",
    "model_name": "gpt-4o-mini",
}


@pytest.mark.asyncio
async def test_create_provider(client: AsyncClient):
    r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "openai-test"
    assert data["model_name"] == "gpt-4o-mini"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_providers_empty(client: AsyncClient):
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_providers_returns_created(client: AsyncClient):
    await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    r = await client.get(BASE + "/")
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.asyncio
async def test_get_provider_by_id(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    provider_id = create_r.json()["id"]

    r = await client.get(f"{BASE}/{provider_id}")
    assert r.status_code == 200
    assert r.json()["id"] == provider_id


@pytest.mark.asyncio
async def test_get_provider_not_found(client: AsyncClient):
    r = await client.get(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_provider(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    provider_id = create_r.json()["id"]

    r = await client.put(f"{BASE}/{provider_id}", json={"model_name": "gpt-3.5-turbo"})
    assert r.status_code == 200
    assert r.json()["model_name"] == "gpt-3.5-turbo"


@pytest.mark.asyncio
async def test_delete_provider(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    provider_id = create_r.json()["id"]

    r = await client.delete(f"{BASE}/{provider_id}")
    assert r.status_code == 204

    r2 = await client.get(f"{BASE}/{provider_id}")
    assert r2.status_code == 404


@pytest.mark.asyncio
async def test_api_key_masked_in_response(client: AsyncClient):
    r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    api_key = r.json()["api_key"]
    # The raw key should never appear in the response
    assert api_key != PROVIDER_PAYLOAD["api_key"]
    assert "***" in api_key or api_key == "****"


@pytest.mark.asyncio
async def test_api_key_masked_short_key(client: AsyncClient):
    payload = {**PROVIDER_PAYLOAD, "name": "short-key", "api_key": "abc"}
    r = await client.post(BASE + "/", json=payload)
    assert r.json()["api_key"] == "****"


@pytest.mark.asyncio
async def test_set_default_provider(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    provider_id = create_r.json()["id"]

    r = await client.post(f"{BASE}/{provider_id}/set-default")
    assert r.status_code == 200
    assert r.json()["is_default"] is True


@pytest.mark.asyncio
async def test_only_one_default_at_a_time(client: AsyncClient):
    p1 = (await client.post(BASE + "/", json=PROVIDER_PAYLOAD)).json()
    p2 = (await client.post(BASE + "/", json={**PROVIDER_PAYLOAD, "name": "second"})).json()

    await client.post(f"{BASE}/{p1['id']}/set-default")
    await client.post(f"{BASE}/{p2['id']}/set-default")

    r1 = await client.get(f"{BASE}/{p1['id']}")
    r2 = await client.get(f"{BASE}/{p2['id']}")

    assert r1.json()["is_default"] is False
    assert r2.json()["is_default"] is True


@pytest.mark.asyncio
async def test_test_connection_returns_success_or_failure(client: AsyncClient):
    create_r = await client.post(BASE + "/", json=PROVIDER_PAYLOAD)
    provider_id = create_r.json()["id"]

    r = await client.post(f"{BASE}/{provider_id}/test-connection")
    assert r.status_code == 200
    data = r.json()
    assert "success" in data
    assert "message" in data
    # With a fake key the connection should gracefully fail
    assert data["success"] is False


@pytest.mark.asyncio
async def test_test_connection_nonexistent_provider(client: AsyncClient):
    r = await client.post(f"{BASE}/00000000-0000-0000-0000-000000000000/test-connection")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_create_provider_missing_required_fields(client: AsyncClient):
    r = await client.post(BASE + "/", json={"name": "incomplete"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_delete_nonexistent_provider_returns_404(client: AsyncClient):
    r = await client.delete(f"{BASE}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
