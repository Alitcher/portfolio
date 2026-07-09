# Alicia's Retro Portfolio

A personal portfolio that looks like a programmer's homepage from **1999–2003**
(Windows 98/2000/XP chrome) but is powered by modern **Vite + TypeScript** — with a
streaming **AliciaAI** assistant hidden inside the retro shell.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the built site locally
```

The `dist/` folder is fully static and can be hosted on **GitHub Pages, Netlify,
Vercel, Cloudflare Pages, S3** or any static host. Routing is hash-based, so no
server rewrites are required.

## Architecture

The frontend is intentionally **backend-ready**. Every page and component depends
only on a single data contract — the `PortfolioApi` interface — never on a concrete
data source:

```
UI (pages / components)
        │  imports `api`
        ▼
services/api.ts            ← facade: picks an implementation from config
        ├── LocalApi       ← bundled mock data + local AI (default, zero server)
        └── HttpApi        ← REST backend (GET/POST /api/*), streaming chat
```

Switching to a real backend is **one environment variable** — no UI changes:

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com
```

`HttpApi` then calls the endpoints from the spec:

| Method | Endpoint              | Purpose                    |
| ------ | --------------------- | -------------------------- |
| GET    | `/api/projects`       | Project list               |
| GET    | `/api/blog`           | Blog posts                 |
| GET    | `/api/resume`         | Resume data                |
| GET    | `/api/visitor-count`  | Visitor counter            |
| POST   | `/api/visitor-count`  | Register a visit           |
| POST   | `/api/chat`           | Streaming AI chat (SSE/chunked) |

### Folder structure

```
src/
  components/   Reusable UI (window, button, menu, counter, ai-chat, project-card, ...)
  pages/        One module per route (home, projects, xr, backend, graphics, blog, resume, contact)
  services/
    router.ts   Tiny hash router
    api.ts      Data-source facade
    api/        PortfolioApi interface + Local/Http implementations
    data/        Mock data (projects, resume, blog-from-markdown)
    search.ts   In-memory full-text search
    knowledge.ts Local AliciaAI brain
    markdown.ts  Minimal dependency-free markdown renderer
  content/blog/ Blog articles as Markdown (frontmatter + body)
  styles/       theme / typography / windows / layout / components / pages
  types.ts      Shared domain models (the data contract)
  config.ts     Runtime configuration
```

## Design principles

- **No frameworks.** Vanilla TypeScript + plain CSS only (no React/Vue/Angular,
  no Tailwind/Bootstrap). Components are plain functions returning DOM nodes.
- **Separation of concerns.** UI, routing and data access are isolated; API calls
  live only inside `services/api/`.
- **Small, modular files.** No inline styles; semantic HTML where practical.
- **Accessible & lazy where it counts**, with `prefers-reduced-motion` respected.

## Retro features

Visitor counter · live desktop clock · fake window controls · pixel icons ·
CRT scanline toggle (button in the title bar) · blinking status light ·
XP-style buttons · old-school scrollbars · blue hyperlinks · fake dial-up
loading while the AI "thinks" · *Best viewed in 1024×768*.

## Notes

- Site owner name lives in one place: `siteOwner` in `src/config.ts` (currently
  **Alicia Pankka**). Contact details (email, GitHub, LinkedIn, location) are in the
  same file.
- `public/assets/resume.pdf` is a placeholder — drop in the real PDF to replace it.
```
