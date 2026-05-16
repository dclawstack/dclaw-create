---
tags: [meta, prd, revised, swarm]
version: 2.3
date: 2026-05-16
app_id: create
app_name: DClaw Create
category: Media
status: P3
---

# 📘 DClaw Create — Revised PRD v2.3

> **The single document every agent must read before writing code for this app.**
> Generated from DClaw Master PRD v2.2. Read the Master PRD first: https://raw.githubusercontent.com/dclawstack/dclaw-prd/main/DClaw-Master-PRD.md

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| **App ID** | `create` |
| **Name** | DClaw Create |
| **Category** | Media |
| **Tagline** | Generate anything |
| **Color** | #EC4899 |
| **Phase** | P3 |
| **Port (Frontend Dev)** | 3079 (TBD — assign before build) |
| **Port (Backend Dev)** | 18149 (TBD — assign before build) |
| **Maturity Tier** | 🟡 Tier 2 — Partial |

---

## 2. Current State Assessment

### 2.1 Scaffold Status
| Component | Status | Notes |
|-----------|--------|-------|
| `frontend/` | ✅ | Next.js 14+ app |
| `backend/` | ✅ | FastAPI + SQLAlchemy 2.0 |
| `docs/` | ✅ | getting-started, guides, reference, releases |
| `helm/` | ✅ | K8s deployment manifests |
| `.github/workflows/` | ✅ | CI/CD + Claude integration |
| `AGENTS.md` | ✅ | Per-repo agent instructions |
| `PLAN-v1.2.md` | ✅ | Feature roadmap |
| `docker-compose.yml` | ✅ | Local dev stack |
| `tests/` | ✅ | pytest + pytest-asyncio |
| `alembic/` | ✅ | Database migrations |
| `dclaw-manifest.json` | ✅ | DPanel registration |

### 2.2 Code Maturity
| Metric | Value |
|--------|-------|
| Python source files (backend) | ~21 |
| TypeScript/TSX files (frontend) | ~15 |
| Total source files | ~36 |
| Tests | ✅ Present |
| Alembic migrations | ✅ Present |
| DPanel manifest | ✅ Present |

### 2.3 Feature Maturity
- **P0 Foundation:** Partially implemented
- **P1 Platform:** Not yet started
- **P2 Vertical:** Not yet started

---

## 3. Gap Analysis

| # | Gap | Severity | Fix |
|---|-----|----------|-----|
| 1 | Partial implementation — needs more domain features | 🟡 | Expand backend services and frontend pages per P0 roadmap |

---

## 4. Sacred Architecture & Tech Stack

> **NON-NEGOTIABLE. Every DClaw product MUST use this exact stack.**

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js 14+ | App Router, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI | Pydantic v2, SQLAlchemy 2.0, asyncpg |
| **Database** | PostgreSQL 16 | CloudNativePG operator in K8s |
| **Vector DB** | Qdrant / pgvector | Only if RAG / semantic search |
| **Cache / Bus** | Redis | 7.x |
| **Object Storage** | MinIO | Latest |
| **Workflow** | Temporal.io | Only if automation/orchestration |
| **Auth** | Logto | JWT validation on all protected routes |
| **Billing** | Stripe | Metered or per-seat |
| **K8s Operator** | Go + controller-runtime | 0.18 |
| **LLM Local** | Ollama | Apple Silicon |
| **LLM Cloud** | OpenRouter + Kimi K2.5 | Fallback |
| **Monitoring** | Prometheus + Grafana | Latest |

### 4.1 Python Rules
- `ruff` formatting enforced
- Type hints on ALL public APIs
- `pydantic` v2 for schemas
- `sqlalchemy` 2.0 style (`Mapped`, `mapped_column`)
- `pytest` + `pytest-asyncio` for tests
- Functions < 50 lines
- No `print()` — use `structlog`

### 4.2 TypeScript / Next.js Rules
- Strict TypeScript (`strict: true`)
- Tailwind for ALL styling
- `cn()` utility for conditional classes
- No `any` without `// @ts-ignore`

### 4.3 Docker Standards
- Port mappings MUST match container listen port
- Healthchecks MUST use binaries present in base image
- `docker compose config` must pass before shipping
- Service type MUST be `ClusterIP`
- TLS required on all ingress

---

## 5. P0 Foundation Features (Must Have — Demo Ready)

> **Every P0 MUST include an AI Copilot per YC S25/W26 RFS.**

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P0.1 | **AI Creative Copilot** | Generate images, videos, audio, and copy from text prompts. | Multimodal LLM + diffusion model + TTS | Generate image in <10s; video in <60s; 10+ style presets |
| P0.2 | **Asset Library** | Organize generated and uploaded media with AI auto-tagging. | Vision embedding + auto-captioning | Auto-tag accuracy >85%; search by color, object, text |
| P0.3 | **Template Gallery** | Pre-built templates for social posts, ads, thumbnails, etc. | AI template recommendation based on platform | 100+ templates; auto-resize for 10+ platforms |
| P0.4 | **Brand Kit** | Store colors, fonts, logos, and voice guidelines for consistency. | AI brand-violation detection in generated content | Enforce brand kit across all outputs; alert on violations |

---

## 6. P1 Platform Features (Should Have — v1.1–1.2)

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P1.1 | **Batch Generation** | Generate 100+ variations for A/B testing campaigns. | AI variation strategy + diversity scoring | Batch 100 images in <5min; auto-group by campaign |
| P1.2 | **Video Editing** | Auto-edit clips with captions, transitions, and B-roll. | AI scene detection + auto-captioning + music matching | Edit 5-min video in <2min; auto-sync captions |
| P1.3 | **Asset Collaboration** | Review, comment, and approve creative assets in teams. | AI sentiment analysis on feedback comments | Comment threads; version history; approval workflow |
| P1.4 | **API Access** | Programmatic asset generation via REST API. | AI rate-limit optimization + queue management | 100 req/min; webhook delivery; SDK for Python/JS |

---

## 7. P2 Vertical / Scale Features (Could Have — v1.3+)

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P2.1 | **3D Asset Generation** | Generate 3D models and scenes from text or images. | NeRF / Gaussian Splatting integration | Generate 3D model in <5min; export to GLB/OBJ |
| P2.2 | **Motion Graphics** | Auto-animate static designs into motion graphics. | AI motion-path generation + easing optimization | 10 animation presets; export to MP4/GIF/Lottie |
| P2.3 | **Custom Model Training** | Fine-tune diffusion models on brand-specific imagery. | LoRA fine-tuning pipeline | Train in <1hr on 20 images; inference latency <5s |
| P2.4 | **Digital Asset Management** | Enterprise-grade DAM with AI-powered search and rights management. | AI rights-expiry detection + usage tracking | Manage 100K+ assets; license tracking; usage analytics |

---

## 8. Scaffold Checklist

Before marking this app "shipped", confirm:

- [ ] `frontend/` with Next.js 14+, Tailwind, shadcn/ui
- [ ] `backend/` with FastAPI, Pydantic v2, SQLAlchemy 2.0, asyncpg
- [ ] `docs/` with getting-started, guides, reference, releases, troubleshooting
- [ ] `helm/` with Chart.yaml, values.yaml, templates (deployment, service, ingress, cloudnativepg)
- [ ] `.github/workflows/` with build-backend.yml, build-frontend.yml, deploy.yml, claude.yml
- [ ] `frontend/public/dclaw-manifest.json` for DPanel registration
- [ ] `backend/tests/` with pytest + pytest-asyncio
- [ ] `backend/alembic/` with initial migration
- [ ] `Dockerfile` + `docker-compose.yml` with correct healthchecks
- [ ] Health endpoint at `/health` returning `{"status":"ok"}`
- [ ] `AGENTS.md` with per-repo instructions
- [ ] `PLAN-v1.2.md` with feature roadmap
- [ ] Port assigned from registry and documented
- [ ] No hardcoded secrets — use `.env.example` + K8s Secrets
- [ ] Non-root containers in Dockerfile

---

## 9. AI Copilot Mandate (YC S25/W26 Requirement)

Every DClaw app MUST have an AI Copilot as its first P0 feature. The copilot must:
1. Be contextually aware of the app's domain data
2. Use RAG over the app's knowledge base where applicable
3. Suggest next actions, not just answer questions
4. Be accessible from every page via floating chat or sidebar
5. Fall back to local Ollama when cloud is unavailable

---

## 10. Next Tasks for Vibe Coders

1. **Complete P0 features**: Finish any incomplete P0 backend services and frontend pages.
2. **Add missing scaffold**: Fill gaps identified above (docs, helm, tests, manifest, etc.).
3. **Start P1 features**: Implement the first 2 P1 features to deepen domain capability.
4. **Polish and integrate**: Ensure health endpoints, Docker builds, and DPanel manifest are production-ready.

---

## 11. Domain Research Notes

Inspired by Canva, Midjourney, Runway, Jasper. Generative AI for creative teams = massive TAM.

---

## 12. Links & Resources

| Resource | URL |
|----------|-----|
| **Master PRD** | https://raw.githubusercontent.com/dclawstack/dclaw-prd/main/DClaw-Master-PRD.md |
| **GitHub Org** | https://github.com/dclawstack |
| **DPanel** | https://dpanel.dclawstack.io |
| **Port Registry** | See `dclaw-platform/PORT_REGISTRY.md` |
| **App PRD Template** | Obsidian Vault → `00-META/📐 App PRD Template.md` |
| **Scaffold Source** | `dclaw-scaffold/` in DClaw-Stack |

---

*Revised PRD version: 2.3*
*Generated: 2026-05-16 by DClaw Stack Generator*
*Next review: When P0 features are complete or architecture changes*
