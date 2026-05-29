# DClaw Create — Backend

FastAPI + async SQLAlchemy 2.0 API server for the DClaw Create AI content-generation studio.

- **Port:** `8154`
- **Base URL:** `http://localhost:8154`
- **API docs:** `http://localhost:8154/docs` (Swagger UI)
- **ReDoc:** `http://localhost:8154/redoc`

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Server](#running-the-server)
7. [Database & Migrations](#database--migrations)
8. [API Reference](#api-reference)
9. [Testing](#testing)
10. [AI Provider Configuration](#ai-provider-configuration)
11. [Seed Data](#seed-data)
12. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Architecture

```
Request → FastAPI Router → Service Layer → Repository Layer → SQLAlchemy (asyncpg) → PostgreSQL
```

- **Routers** (`app/api/v1/`) — thin HTTP layer, validates input via Pydantic schemas, delegates to services
- **Services** (`app/services/`) — business logic, LLM dispatch, brand context injection
- **Repositories** (`app/repositories/`) — all DB queries, no raw SQL in services or routers
- **Models** (`app/models/`) — SQLAlchemy 2.0 `DeclarativeBase` + `Mapped`/`mapped_column`, lazy="selectin"
- **Schemas** (`app/schemas/`) — Pydantic v2 `ConfigDict(from_attributes=True)` request/response models

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   └── health.py           # GET /health/
│   │   ├── v1/
│   │   │   ├── assets.py           # /api/v1/assets
│   │   │   ├── brand_kits.py       # /api/v1/brand-kits
│   │   │   ├── collections.py      # /api/v1/collections
│   │   │   ├── copilot.py          # /api/v1/copilot
│   │   │   ├── dashboard.py        # /api/v1/dashboard
│   │   │   ├── generations.py      # /api/v1/generations
│   │   │   ├── llm_providers.py    # /api/v1/llm-providers
│   │   │   ├── seed.py             # /api/v1/seed
│   │   │   └── templates.py        # /api/v1/templates
│   │   └── main.py                 # FastAPI app, CORS, lifespan
│   ├── core/
│   │   ├── config.py               # Settings (pydantic-settings, reads .env)
│   │   └── database.py             # Async engine, session factory, get_db
│   ├── models/
│   │   ├── base.py                 # DeclarativeBase, UUIDPrimaryKeyMixin, TimestampMixin
│   │   ├── asset.py                # Asset, AssetTag, Collection, collection_assets M2M
│   │   ├── brand_kit.py            # BrandKit
│   │   ├── copilot.py              # CopilotSession, CopilotMessage
│   │   ├── generation_job.py       # GenerationJob
│   │   ├── llm_provider.py         # LLMProvider
│   │   └── template.py             # Template
│   ├── repositories/               # One repo per model, BaseRepository[T]
│   ├── schemas/                    # Pydantic v2 request/response models
│   └── services/
│       ├── brand_service.py        # Brand context injection, violation check
│       ├── copilot_service.py      # Chat with creative-director system prompt
│       ├── generation_service.py   # Job creation, LLM dispatch, stats
│       ├── llm_service.py          # OpenRouter / Ollama dispatch
│       └── seed_service.py         # Idempotent seed data, clear logic
├── alembic/
│   ├── versions/
│   │   ├── 24bc649c9249_add_llm_providers_and_generation_jobs.py
│   │   └── 3b4d4691cb93_add_copilot_assets_templates_brand_kits.py
│   └── env.py                      # Async migration runner
├── tests/
│   ├── conftest.py                 # Test DB engine, setup_db autouse fixture, client fixture
│   ├── test_health.py
│   ├── test_llm_providers.py
│   ├── test_generations.py
│   ├── test_copilot.py
│   ├── test_assets.py
│   ├── test_templates.py
│   ├── test_brand_kits.py
│   ├── test_seed.py
│   └── test_dashboard.py
├── .env                            # Local env (gitignored)
├── requirements.txt
└── Dockerfile
```

---

## Prerequisites

| Dependency | Version | Notes |
|---|---|---|
| Python | 3.11+ | 3.12 recommended |
| PostgreSQL | 15+ | Via Docker or local install |
| Docker | 24+ | For containerised runs |

---

## Local Setup

```bash
# 1. Create and activate virtualenv
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start Postgres (Docker — adjust host port if 5432 is taken)
docker run -d \
  --name dclaw-create-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dclaw_create \
  -p 5435:5432 \
  postgres:16-alpine

# 4. Copy and configure env
cp .env.example .env   # then edit DATABASE_URL if needed

# 5. Run migrations
alembic upgrade head

# 6. Start the server
uvicorn app.api.main:app --reload --port 8154
```

---

## Environment Variables

All variables are read from `.env` in the `backend/` directory (via `pydantic-settings`).

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_create` | Async PostgreSQL connection string — must use `asyncpg` driver |
| `APP_ENV` | `dev` | Environment name (`dev`, `production`) |
| `DEBUG` | `true` | Enables debug mode |
| `SECRET_KEY` | `change-me-in-production` | JWT signing key — **change before deploying** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiry |

**Example `.env` for local dev with Postgres on port 5435:**
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_create
APP_ENV=dev
SECRET_KEY=my-local-dev-secret
```

---

## Running the Server

### Development (hot reload)
```bash
source venv/bin/activate
uvicorn app.api.main:app --reload --port 8154
```

### Production-style
```bash
uvicorn app.api.main:app --host 0.0.0.0 --port 8154 --workers 2
```

### Via Docker Compose (full stack)
```bash
# from repo root
docker compose up --build
```

### Health check
```bash
curl http://localhost:8154/health/
# → {"status": "ok"}
```

---

## Database & Migrations

All migrations use **Alembic** in async mode.

```bash
# Apply all pending migrations
alembic upgrade head

# Check current revision
alembic current

# Show migration history
alembic history --verbose

# Create a new migration (after editing models)
alembic revision --autogenerate -m "describe your change"

# Roll back one step
alembic downgrade -1

# Roll back to base (empty DB)
alembic downgrade base
```

> **Note:** `alembic/env.py` imports `app.models` to register all models with `Base.metadata` before auto-generate scans for changes. Always import new model files there when adding a model.

---

## API Reference

All routes are prefixed with `/api/v1/`. Interactive docs at `/docs`.

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/health/` | Liveness check |

### LLM Providers
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/llm-providers/` | List all providers |
| POST | `/api/v1/llm-providers/` | Create a provider |
| GET | `/api/v1/llm-providers/{id}` | Get provider by ID |
| PUT | `/api/v1/llm-providers/{id}` | Update provider |
| DELETE | `/api/v1/llm-providers/{id}` | Delete provider |
| PUT | `/api/v1/llm-providers/{id}/set-default` | Set as default provider |
| POST | `/api/v1/llm-providers/{id}/test-connection` | Test connectivity |

### Generations
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/generations/` | List jobs (filter: `job_type`, `status`, `limit`, `offset`) |
| POST | `/api/v1/generations/` | Create and run a generation job |
| GET | `/api/v1/generations/{id}` | Get job by ID |
| GET | `/api/v1/generations/stats` | Aggregated job statistics |

**Job types:** `text`, `image`, `audio`, `video`

### Copilot
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/copilot/sessions` | List all sessions |
| POST | `/api/v1/copilot/sessions` | Create a session |
| GET | `/api/v1/copilot/sessions/{id}` | Get session + messages |
| DELETE | `/api/v1/copilot/sessions/{id}` | Delete session (cascades messages) |
| POST | `/api/v1/copilot/sessions/{id}/messages` | Send a message, receive assistant reply |

### Assets
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/assets/` | List assets (filter: `asset_type`, `limit`, `offset`) |
| POST | `/api/v1/assets/` | Create an asset |
| GET | `/api/v1/assets/{id}` | Get asset by ID |
| PUT | `/api/v1/assets/{id}` | Update asset |
| DELETE | `/api/v1/assets/{id}` | Delete asset |
| POST | `/api/v1/assets/{id}/tags` | Add tag to asset |
| GET | `/api/v1/assets/{id}/tags` | List tags for asset |
| DELETE | `/api/v1/assets/{id}/tags/{tag}` | Remove tag |

### Collections
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/collections/` | List collections |
| POST | `/api/v1/collections/` | Create collection |
| GET | `/api/v1/collections/{id}` | Get collection |
| DELETE | `/api/v1/collections/{id}` | Delete collection |
| POST | `/api/v1/collections/{id}/assets/{asset_id}` | Add asset to collection |
| DELETE | `/api/v1/collections/{id}/assets/{asset_id}` | Remove asset from collection |

### Templates
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/templates/` | List templates (filter: `category`, `platform`, `featured`) |
| POST | `/api/v1/templates/` | Create template |
| GET | `/api/v1/templates/{id}` | Get template |
| PUT | `/api/v1/templates/{id}` | Update template |
| DELETE | `/api/v1/templates/{id}` | Delete template |
| GET | `/api/v1/templates/recommend` | AI-assisted recommendations (stub) |

### Brand Kits
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/brand-kits/` | List brand kits |
| POST | `/api/v1/brand-kits/` | Create brand kit |
| GET | `/api/v1/brand-kits/active` | Get active brand kit |
| GET | `/api/v1/brand-kits/{id}` | Get brand kit |
| PUT | `/api/v1/brand-kits/{id}` | Update brand kit |
| DELETE | `/api/v1/brand-kits/{id}` | Delete brand kit |
| PUT | `/api/v1/brand-kits/{id}/set-active` | Set as active kit |
| POST | `/api/v1/brand-kits/{id}/check-violation` | Check content for brand violations |

### Seed Data
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/seed` | Insert seed data (idempotent) |
| GET | `/api/v1/seed/status` | Count of seeded records per model |
| DELETE | `/api/v1/seed` | Remove only seeded records (user data is safe) |

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Counts + recent items for all entities |

---

## Testing

Tests use **pytest + pytest-asyncio** against a real PostgreSQL test database. No mocking of the DB layer.

```bash
# Create the test database (once)
docker exec dclaw-create-pg psql -U postgres -c "CREATE DATABASE dclaw_create_test;"

# Run all tests
source venv/bin/activate
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_create_test \
  pytest tests/ -v

# Run a specific file
DATABASE_URL=... pytest tests/test_generations.py -v

# Run a specific test by name
DATABASE_URL=... pytest tests/test_seed.py::test_user_asset_survives_seed_delete -v

# Run with short traceback (less noise)
DATABASE_URL=... pytest tests/ --tb=short

# Run and stop at first failure
DATABASE_URL=... pytest tests/ -x
```

**Test coverage:** 96 tests across 9 files. Every router, key service behaviour, pagination, and seed idempotency is covered.

The `setup_db` autouse fixture in `conftest.py` drops and recreates all tables before every test — tests are fully isolated.

---

## AI Provider Configuration

The LLM service dispatches to one of two backends based on the provider's `provider_type`:

### OpenRouter
```json
POST /api/v1/llm-providers/
{
  "name": "openrouter-default",
  "display_name": "OpenRouter",
  "provider_type": "openrouter",
  "api_key": "sk-or-...",
  "base_url": "https://openrouter.ai/api/v1",
  "model_name": "openai/gpt-4o-mini"
}
```

### Ollama (local)
```json
POST /api/v1/llm-providers/
{
  "name": "ollama-local",
  "display_name": "Ollama Local",
  "provider_type": "ollama",
  "base_url": "http://localhost:11434",
  "model_name": "llama3"
}
```

After creating, call `PUT /api/v1/llm-providers/{id}/set-default` to make it the active provider. Generation requests will fall back to a stub response when no default provider is configured.

---

## Seed Data

Seed data populates 21 templates, 12 assets, 3 collections, 3 brand kits, and sample generations. All seeded records have `is_seeded=True` and fixed UUIDs (prefixed `a0000003-...` for templates, `b0000001-...` for brand kits, etc.).

```bash
# Seed via API
curl -X POST http://localhost:8154/api/v1/seed

# Check seed status
curl http://localhost:8154/api/v1/seed/status

# Clear seeded data (user records are never touched)
curl -X DELETE http://localhost:8154/api/v1/seed
```

---

## Common Issues & Troubleshooting

### `asyncpg.exceptions.InvalidCatalogNameError: database "..." does not exist`
The target database hasn't been created yet.
```bash
# For dev DB
docker exec dclaw-create-pg psql -U postgres -c "CREATE DATABASE dclaw_create;"

# For test DB
docker exec dclaw-create-pg psql -U postgres -c "CREATE DATABASE dclaw_create_test;"
```

### `connection refused` on port 5432 / `address already in use`
Another Postgres container is using port 5432. Map the container to a different host port:
```bash
docker run -d --name dclaw-create-pg -p 5435:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dclaw_create postgres:16-alpine
```
Then update `.env`:
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_create
```

### `ModuleNotFoundError: No module named 'app'`
Run `uvicorn` (and `alembic`) from the `backend/` directory, not the repo root.
```bash
cd backend
uvicorn app.api.main:app --reload --port 8154
```

### Alembic `Target database is not up to date`
```bash
alembic upgrade head
```

### Alembic autogenerate produces empty migration
Ensure `alembic/env.py` imports `app.models` before the `run_migrations_*` calls. All model files must be imported so SQLAlchemy registers them with `Base.metadata`.

### `ValueError: invalid literal for int() with base 16`
Seed UUID contained a non-hex character. This was fixed — all template seed IDs now use `a0000003-...` prefix. If you see this in a branch, check for any UUIDs using letters beyond `f`.

### `PydanticDeprecatedSince20: Support for class-based config is deprecated`
`app/core/config.py` uses the older `class Config` style in `Settings`. This is a warning only — the app works correctly. To suppress it, migrate to `model_config = SettingsConfigDict(...)`.

### Tests fail: `asyncpg.exceptions.InvalidCatalogNameError` during `pytest`
The test database doesn't exist. Create it:
```bash
docker exec dclaw-create-pg psql -U postgres -c "CREATE DATABASE dclaw_create_test;"
```
Then always pass `DATABASE_URL` when running tests (the conftest default points to port 5432):
```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5435/dclaw_create_test pytest tests/ -v
```

### `ImportError while loading conftest` / module-level crash on import
Most likely `seed_service.py` is being imported and something at module level is failing (e.g. UUID parsing). Check the full traceback for the exact line.

### Server starts but `/docs` returns 404
Ensure you're hitting the correct port (`8154`) and that the path is `/docs`, not `/api/docs`.

### CORS errors from frontend
The backend allows all origins (`*`) in development. If you see CORS errors, check:
1. The frontend is proxying `/api/v1/` to `http://localhost:8154` (see `next.config.js`)
2. The backend is actually running on port 8154
3. There is no firewall rule blocking the port
