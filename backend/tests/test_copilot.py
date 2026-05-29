import pytest
from httpx import AsyncClient

BASE = "/api/v1/copilot"
SESSIONS = BASE + "/sessions"


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    r = await client.post(SESSIONS, json={"title": "My Session"})
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "My Session"
    assert "id" in data
    assert data["message_count"] == 0


@pytest.mark.asyncio
async def test_create_session_default_title(client: AsyncClient):
    r = await client.post(SESSIONS, json={})
    assert r.status_code == 201
    assert r.json()["title"] == "New Session"


@pytest.mark.asyncio
async def test_list_sessions_empty(client: AsyncClient):
    r = await client.get(SESSIONS)
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_sessions_returns_created(client: AsyncClient):
    await client.post(SESSIONS, json={"title": "Session A"})
    await client.post(SESSIONS, json={"title": "Session B"})

    r = await client.get(SESSIONS)
    assert r.status_code == 200
    assert len(r.json()) == 2


@pytest.mark.asyncio
async def test_get_session(client: AsyncClient):
    create_r = await client.post(SESSIONS, json={"title": "Detail Session"})
    session_id = create_r.json()["id"]

    r = await client.get(f"{SESSIONS}/{session_id}")
    assert r.status_code == 200
    assert r.json()["id"] == session_id


@pytest.mark.asyncio
async def test_get_nonexistent_session_returns_404(client: AsyncClient):
    r = await client.get(f"{SESSIONS}/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_delete_session(client: AsyncClient):
    create_r = await client.post(SESSIONS, json={"title": "To Delete"})
    session_id = create_r.json()["id"]

    r = await client.delete(f"{SESSIONS}/{session_id}")
    assert r.status_code == 204

    r2 = await client.get(f"{SESSIONS}/{session_id}")
    assert r2.status_code == 404


@pytest.mark.asyncio
async def test_send_message_returns_assistant_reply(client: AsyncClient):
    session_id = (await client.post(SESSIONS, json={"title": "Chat"})).json()["id"]

    r = await client.post(
        f"{SESSIONS}/{session_id}/messages",
        json={"content": "Help me write a catchy headline"},
    )
    assert r.status_code == 201
    data = r.json()
    assert "user_message" in data
    assert "assistant_message" in data
    assert data["user_message"]["role"] == "user"
    assert data["assistant_message"]["role"] == "assistant"
    assert data["user_message"]["content"] == "Help me write a catchy headline"
    assert len(data["assistant_message"]["content"]) > 0


@pytest.mark.asyncio
async def test_send_message_to_nonexistent_session_returns_404(client: AsyncClient):
    r = await client.post(
        f"{SESSIONS}/00000000-0000-0000-0000-000000000000/messages",
        json={"content": "Hello"},
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_message_history_ordered_correctly(client: AsyncClient):
    session_id = (await client.post(SESSIONS, json={"title": "History"})).json()["id"]

    r1 = await client.post(
        f"{SESSIONS}/{session_id}/messages", json={"content": "First message"}
    )
    r2 = await client.post(
        f"{SESSIONS}/{session_id}/messages", json={"content": "Second message"}
    )

    # user messages should reflect order of sending
    assert r1.json()["user_message"]["content"] == "First message"
    assert r2.json()["user_message"]["content"] == "Second message"


@pytest.mark.asyncio
async def test_session_message_count_increments(client: AsyncClient):
    session_id = (await client.post(SESSIONS, json={"title": "Counter"})).json()["id"]

    await client.post(f"{SESSIONS}/{session_id}/messages", json={"content": "msg 1"})
    await client.post(f"{SESSIONS}/{session_id}/messages", json={"content": "msg 2"})

    r = await client.get(f"{SESSIONS}/{session_id}")
    # 2 user + 2 assistant = 4 messages
    assert r.json()["message_count"] == 4


@pytest.mark.asyncio
async def test_delete_session_cascades_to_messages(client: AsyncClient):
    session_id = (await client.post(SESSIONS, json={"title": "Cascade"})).json()["id"]
    await client.post(f"{SESSIONS}/{session_id}/messages", json={"content": "hello"})

    await client.delete(f"{SESSIONS}/{session_id}")

    # Session gone
    r = await client.get(f"{SESSIONS}/{session_id}")
    assert r.status_code == 404
