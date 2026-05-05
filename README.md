# DClaw Create

**Generate anything**

AI Content Studio built with Next.js. A frontend-heavy content generation platform with mock generation UI for text, image, audio, and video.

## Architecture

```
dclaw-create/
├── frontend/    → Next.js 14 (App Router), Tailwind CSS
├── helm/        → Kubernetes manifests (frontend-only)
└── docker-compose.yml
```

## Quick Start

### Docker Compose

```bash
docker-compose up --build
```

- App: http://localhost:3007

### Local Development

```bash
cd frontend
npm install
npm run dev
```

## Pages

| Page | Description |
|------|-------------|
| `/dashboard` | Recent creations, stats, quick-start templates |
| `/generate/text` | AI text generator with mock streaming |
| `/generate/image` | Text-to-image prompt builder, mock gallery |
| `/generate/audio` | Voice clone / TTS interface, mock player |
| `/generate/video` | Text-to-video storyboard, mock timeline |
| `/settings` | API keys, model selection, theme |

## License

Proprietary — DClaw Stack
