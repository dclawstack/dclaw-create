# DClaw Create — Frontend

Next.js 14 App Router frontend for the DClaw Create AI content-generation studio.

- **Dev port:** `3007`
- **Dev URL:** `http://localhost:3007`
- **Backend proxy:** All `/api/v1/*` requests are rewritten to `http://localhost:8154`

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [Pages & Routes](#pages--routes)
8. [Component Library](#component-library)
9. [Theming](#theming)
10. [API Integration](#api-integration)
11. [Testing](#testing)
12. [Building for Production](#building-for-production)
13. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Architecture

```
Browser → Next.js (App Router) → /api/v1/* proxy rewrite → FastAPI backend :8154
```

- **App Router** (`src/app/`) — every route is a Server Component by default; interactive pages use `"use client"` at the top
- **API proxy** — `next.config.js` rewrites `/api/v1/*` to the backend, so all `fetch("/api/v1/...")` calls go through Next.js without exposing the backend origin to the browser
- **Theming** — CSS custom properties on `:root` + `.dark`, toggled by a `ThemeProvider` that persists to `localStorage`. No flash on load because the `dark` class is applied client-side via `useEffect`
- **No external component library** — all UI primitives are hand-written in `src/components/ui/`

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout — wraps children in ClientLayout
│   │   ├── client-layout.tsx       # ThemeProvider + conditional sidebar (hidden on /)
│   │   ├── globals.css             # CSS custom properties for light/dark themes
│   │   ├── not-found.tsx           # Global 404 page
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Stats, quick actions, seed controls
│   │   ├── copilot/
│   │   │   └── page.tsx            # AI creative-director chat
│   │   ├── generate/
│   │   │   ├── text/page.tsx
│   │   │   ├── image/page.tsx
│   │   │   ├── audio/page.tsx
│   │   │   └── video/page.tsx
│   │   ├── assets/
│   │   │   ├── page.tsx            # Asset grid with filters
│   │   │   └── [id]/page.tsx       # Asset detail
│   │   ├── templates/
│   │   │   └── page.tsx            # Template gallery
│   │   ├── brand-kit/
│   │   │   └── page.tsx            # Brand kit manager
│   │   └── settings/
│   │       ├── page.tsx            # Settings hub
│   │       └── ai-providers/
│   │           └── page.tsx        # LLM provider configuration
│   ├── components/
│   │   ├── ui/                     # Primitive UI components (no external lib)
│   │   │   ├── button.tsx          # CVA variants: default, destructive, outline, secondary, ghost, link
│   │   │   ├── card.tsx            # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx           # CVA variants: default, secondary, destructive, outline
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx          # Custom Dialog using React Context (no Radix)
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx            # Custom Tabs using React Context
│   │   │   └── avatar.tsx
│   │   ├── landing/
│   │   │   ├── navbar.tsx          # Fixed top nav, blur backdrop, theme toggle
│   │   │   ├── hero-section.tsx    # Animated hero with floating elements
│   │   │   ├── feature-carousel.tsx # Auto-scrolling feature strip
│   │   │   ├── copilot-demo.tsx    # Interactive mock generation demo
│   │   │   └── cta-strip.tsx       # Pink-to-purple gradient CTA
│   │   ├── sidebar.tsx             # Main app nav (collapsible Generate section)
│   │   ├── progress-bar.tsx        # Generation progress indicator
│   │   ├── prompt-input.tsx        # Multi-line prompt textarea
│   │   └── result-gallery.tsx      # Generated result display grid
│   ├── lib/
│   │   ├── api.ts                  # apiGet / apiPost / apiPut / apiDelete + ApiError
│   │   ├── theme.ts                # ThemeProvider + useTheme hook
│   │   └── utils.ts                # cn() Tailwind class merger
│   └── __tests__/                  # Vitest + React Testing Library
│       ├── button.test.tsx
│       ├── card.test.tsx
│       ├── input.test.tsx
│       ├── badge.test.tsx
│       ├── dialog.test.tsx
│       ├── tabs.test.tsx
│       ├── api.test.ts
│       └── theme.test.tsx
├── next.config.js                  # API proxy rewrites, standalone output
├── tailwind.config.ts              # Dark mode, brand colors, CSS var tokens
├── tsconfig.json                   # strict mode, @/* → ./src/*
├── vitest.config.ts
├── vitest.setup.ts
└── Dockerfile
```

---

## Prerequisites

| Dependency | Version |
|---|---|
| Node.js | 18.17+ (LTS) |
| npm | 9+ |
| Backend | Running on port 8154 |

---

## Local Setup

```bash
# From the frontend/ directory
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app is available at `http://localhost:3007`. The dev server hot-reloads on file changes.

The backend must be running on port `8154` for API calls to work. The dev server proxies all `/api/v1/*` requests — no CORS configuration needed.

---

## Environment Variables

Variables are read at build time (Next.js inlines `NEXT_PUBLIC_*`) and at runtime for server-side rewrites.

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8154` | Backend base URL. Used in `next.config.js` for the proxy rewrite destination. Also available client-side if needed. |
| `PORT` | `3007` | Port the Next.js server listens on. |

**Local dev:** no `.env` file is needed — defaults work out of the box.

**Docker / staging:** pass `NEXT_PUBLIC_API_URL` as a build arg (the Dockerfile declares `ARG NEXT_PUBLIC_API_URL`) so the proxy destination is baked into the standalone build:
```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://backend:8154 -t dclaw-create-frontend .
```

---

## Running the App

### Development (hot reload)
```bash
npm run dev
# → http://localhost:3007
```

### Production build + start
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

### Via Docker Compose (full stack, from repo root)
```bash
docker compose up --build
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing page | Public hero, feature carousel, Copilot demo, CTA. No sidebar. |
| `/dashboard` | Dashboard | Stats cards, quick-action tiles, recent items, seed data controls. |
| `/copilot` | AI Copilot | Chat sessions with the creative-director AI. |
| `/generate/text` | Text Generator | Prompt input → text generation via backend. |
| `/generate/image` | Image Generator | Prompt input → image generation. |
| `/generate/audio` | Audio Generator | Prompt input → audio generation. |
| `/generate/video` | Video Generator | Prompt input → video generation. |
| `/assets` | Asset Library | Grid with type filter tabs, search, add asset dialog. |
| `/assets/[id]` | Asset Detail | Tags, collection membership, metadata. |
| `/templates` | Templates | Gallery with category/platform filters, AI recommendations. |
| `/brand-kit` | Brand Kit | Kit cards, color palette editor, font list. |
| `/settings` | Settings Hub | Navigation to sub-settings pages. |
| `/settings/ai-providers` | AI Providers | Add/edit/test LLM providers (OpenRouter, Ollama). |

The landing page (`/`) uses a clean layout (no sidebar). All other routes render inside the sidebar layout via `client-layout.tsx`.

---

## Component Library

All UI primitives are in `src/components/ui/` and use CSS custom properties for theming — they work in both light and dark mode without any changes.

### Button
```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

**Variants:** `default` (brand-pink fill) · `destructive` (red) · `outline` · `secondary` · `ghost` · `link`  
**Sizes:** `default` · `sm` · `lg` · `icon`

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle text</CardDescription>
  </CardHeader>
  <CardContent>Main content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Dialog
Custom implementation using React Context — no Radix dependency.
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <p>Content</p>
    <DialogClose />
  </DialogContent>
</Dialog>
```

Closes on: backdrop click, `Escape` key, or `<DialogClose />`.

### Tabs
Custom implementation using React Context.
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="one">
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">Panel one</TabsContent>
  <TabsContent value="two">Panel two</TabsContent>
</Tabs>
```

### Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Active</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

---

## Theming

The app supports **dark** (default) and **light** themes.

- **CSS custom properties** are defined in `globals.css` under `:root` (light) and `.dark` (dark).
- The `dark` class is toggled on `document.documentElement` by `ThemeProvider`.
- Theme choice is persisted in `localStorage` under the key `"theme"`.
- Tailwind is configured with `darkMode: "class"`.

**Brand colors:**

| Token | Hex | Usage |
|---|---|---|
| `brand-pink` / `--accent` | `#EC4899` | Primary CTA, active states, links, gradients |
| `brand-purple` | `#8B5CF6` | Secondary accents, gradients |

**Using the theme hook:**
```tsx
"use client";
import { useTheme } from "@/lib/theme";

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === "dark" ? "Light" : "Dark"}</button>;
}
```

---

## API Integration

All API calls go through the helpers in `src/lib/api.ts`. They use relative paths — the Next.js proxy handles routing to the backend.

```ts
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";

// GET
const templates = await apiGet<Template[]>("/api/v1/templates/");

// POST
const job = await apiPost<GenerationJob>("/api/v1/generations/", {
  job_type: "text",
  prompt: "Write a product description for...",
});

// PUT
const updated = await apiPut<BrandKit>(`/api/v1/brand-kits/${id}`, { name: "New Name" });

// DELETE
await apiDelete(`/api/v1/assets/${id}`);
```

**Error handling:** all helpers throw `ApiError` (with `.status: number`) on non-2xx responses.
```ts
try {
  const data = await apiGet("/api/v1/missing");
} catch (e) {
  if (e instanceof ApiError && e.status === 404) {
    // handle not found
  }
}
```

---

## Testing

Tests use **Vitest + React Testing Library** with a jsdom environment.

```bash
# Run all tests (single pass)
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch

# Run a specific file
npx vitest run src/__tests__/button.test.tsx

# Run tests matching a name pattern
npx vitest run --reporter=verbose -t "Dialog"
```

**Test coverage:** 35 tests across 8 files covering all UI primitives (`button`, `card`, `input`, `badge`, `dialog`, `tabs`), the API client, and the `ThemeProvider`.

Tests use `vi.stubGlobal("fetch", ...)` to mock network calls — no real HTTP requests are made.

---

## Building for Production

```bash
npm run build
```

The build output is a **standalone** Next.js app (configured via `output: "standalone"` in `next.config.js`). This bundles only the required `node_modules` for deployment, making the Docker image significantly smaller.

```bash
# After build — start the standalone server
node .next/standalone/server.js
```

The `Dockerfile` uses a multi-stage build:
1. **deps** — installs `node_modules`
2. **builder** — runs `npm run build` (requires `NEXT_PUBLIC_API_URL` build arg)
3. **runner** — copies only the standalone output for a minimal production image

---

## Common Issues & Troubleshooting

### API calls return `404` or `ECONNREFUSED` in the browser
The Next.js proxy (`/api/v1/*` → backend) only works when the **Next.js dev server is running**. Direct browser requests to the backend on a different port will fail due to CORS.

Ensure:
1. Backend is running: `curl http://localhost:8154/health/` returns `{"status": "ok"}`
2. Frontend dev server is running on port 3007
3. All API calls in the code use relative paths (`/api/v1/...`), not `http://localhost:8154/...`

### `NEXT_PUBLIC_API_URL` changes not reflected after build
`NEXT_PUBLIC_*` variables are inlined at **build time**. After changing the variable you must rebuild:
```bash
npm run build
```
For Docker, pass it as a build arg:
```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://my-backend:8154 .
```

### Theme flash on initial page load (white flash before dark)
The `dark` class is applied via `useEffect` in `ThemeProvider`, which runs after hydration. If you see a flash, check that `client-layout.tsx` is wrapping the app at the root and that `ThemeProvider` is the outermost wrapper.

### `useTheme must be used within ThemeProvider`
A component is calling `useTheme()` outside the `<ThemeProvider>` tree. In tests, wrap the component under test:
```tsx
render(<ThemeProvider><MyComponent /></ThemeProvider>);
```

### `Module not found: Can't resolve '@/...'`
The `@/*` path alias maps to `./src/*`. Ensure:
1. `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`
2. `vitest.config.ts` has `resolve.alias: { "@": resolve(__dirname, "./src") }`

### TypeScript errors: `Property 'X' does not exist on type 'Y'`
Run the type checker directly to see all errors at once:
```bash
npx tsc --noEmit
```

### `npm run build` fails with `SyntaxError` or module resolution error
Check that all imports use the `@/` alias and that the referenced file exists under `src/`. The build runs the TypeScript compiler in strict mode.

### Dialog doesn't close when clicking the backdrop
The backdrop click handler is on the outer `fixed inset-0 z-50` div. If content inside the dialog calls `e.stopPropagation()`, it won't bubble. The `<DialogContent>` inner div already calls `e.stopPropagation()` to prevent accidental closes — clicking outside it (the overlay) closes correctly.

### Sidebar not visible on a page
`client-layout.tsx` hides the sidebar when `pathname === "/"` (landing page only). All other routes show the sidebar. If a new route needs no sidebar, add its path to the conditional check in `client-layout.tsx`.

### Vitest: `ReferenceError: vi is not defined`
Add `globals: true` to `vitest.config.ts` (already set) and ensure the test file doesn't import `vi` manually — it's injected globally.

### `@testing-library/jest-dom` matchers not available (e.g. `toBeInTheDocument is not a function`)
The setup file `vitest.setup.ts` imports `@testing-library/jest-dom`. Ensure `vitest.config.ts` has:
```ts
test: {
  setupFiles: ["./vitest.setup.ts"],
}
```

### Port 3007 already in use
```bash
# Find and kill the process on port 3007
lsof -ti:3007 | xargs kill -9
npm run dev
```
