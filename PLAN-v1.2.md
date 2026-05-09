# DClaw Create — v1.2 Feature Roadmap

> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (stable-diffusion-webui, comfyui), AI product research (Midjourney, DALL-E, Canva, Runway)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Project canvas
- [ ] Text-to-image generation
- [ ] Asset library
- [ ] Basic export
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Create Copilot (Creative Director)
**Description:** AI assistant that generates creative assets from prompts, suggests improvements, and manages creative projects. "Create a social media campaign for our product launch."
- **AI Angle:** Multi-modal generation (text, image, video). Project planning with AI.
- **Backend:** `/api/v1/ai/create-chat` endpoint. Generation pipeline orchestrator.
- **Frontend:** Chat panel with generated asset previews. Project brief generator.
- **Files:** `backend/app/services/create_ai.py`, `frontend/src/components/create-copilot.tsx`

#### 2. Text-to-Image Generation
**Description:** Generate images from text prompts with style control, inpainting, and outpainting.
- **AI Angle:** SDXL/Flux integration. Style transfer. ControlNet for pose/composition.
- **Backend:** Image generation queue. GPU worker management.
- **Frontend:** Prompt editor with style presets. Gallery grid.
- **Files:** `backend/app/services/image_gen.py`

#### 3. Text-to-Video Generation
**Description:** Generate short videos from text prompts or image sequences.
- **AI Angle:** Video diffusion models (Luma AI / Runway-style).
- **Backend:** Video generation pipeline.
- **Frontend:** Video preview with playback controls.
- **Files:** `backend/app/services/video_gen.py`

#### 4. Asset Management & Organization
**Description:** Organize generated assets into projects, folders, and collections. Tag and search.
- **Backend:** Asset storage with metadata. AI auto-tagging.
- **Frontend:** Asset grid with filters. Project folders.
- **Files:** `backend/app/services/asset_manager.py`

### P1 — Should Have (v1.1–1.2)

#### 5. Brand Kit & Style Consistency
**Description:** Define brand colors, fonts, logos. Enforce consistency across all generated assets.
- **Backend:** Brand kit validation. Style prompt injection.
- **Frontend:** Brand kit editor. Consistency checker.

#### 6. Batch Generation & Variations
**Description:** Generate multiple variations from one prompt. A/B test creative assets.
- **Backend:** Batch generation with parameter sweeps.
- **Frontend:** Variation grid with comparison tools.

#### 7. Upscaling & Enhancement
**Description:** Upscale images, remove backgrounds, enhance details, fix faces.
- **AI Angle:** Super-resolution. Background removal. Face restoration.
- **Backend:** Enhancement pipeline.
- **Frontend:** Before/after comparison slider.

#### 8. Social Media Export & Scheduling
**Description:** Export optimized formats for each platform. Schedule posts.
- **Backend:** Format templates. Scheduling API.
- **Frontend:** Platform-specific export presets. Calendar view.

### P2 — Could Have (v1.3+)

#### 9. 3D Asset Generation
**Description:** Generate 3D models from text or images for product visualization.

#### 10. AI Music & Sound Effects
**Description:** Generate background music and sound effects for videos.

#### 11. Collaborative Creative Workspaces
**Description:** Real-time collaborative canvas for creative teams.

#### 12. AI A/B Testing for Creative
**Description:** Auto-generate and test creative variants to find highest-performing assets.

---

## Implementation Priority

1. **Week 1–2:** AI Create Copilot (P0.1) + Text-to-Image (P0.2)
2. **Week 3–4:** Text-to-Video (P0.3) + Asset Management (P0.4)
3. **Week 5–6:** Brand Kit (P1.5) + Batch Generation (P1.6)
4. **Week 7–8:** Upscaling (P1.7) + Social Export (P1.8)
