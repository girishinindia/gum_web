# gum_web

Modern Next.js 15 frontend for **Grow Up More** — a reimplementation of the
existing PHP `gum_frontend_portal` with the same visual theme plus modern
upgrades (Framer Motion scroll reveals, streaming SSR, dark-mode-ready tokens,
glassmorphism + subtle grain).

> **Scope today:** home page only. Auth, dashboard, courses, learn, profile and
> checkout flows will land in later phases.

## Stack

- Next.js 15 (App Router) · React 18 · TypeScript
- Tailwind CSS 3 with the brand sky-* + indigo accent palette extracted from
  the PHP `style.css`
- Framer Motion for scroll-driven reveals
- `lucide-react` for icons

## Getting started

```bash
cd gum_web
npm install
cp .env.example .env.local      # then point NEXT_PUBLIC_API_BASE_URL at gum_api
npm run dev                     # http://localhost:3000
```

## Data sources

| Section            | Source                                                |
| ------------------ | ----------------------------------------------------- |
| Categories         | `GET /api/sub-categories?active=true&limit=100`       |
| Popular Courses    | `GET /api/courses?is_featured=true&limit=9`           |
| FAQ                | `GET /api/faqs?active=true`                           |
| Languages Banner   | `GET /api/languages?active=true`                      |
| All other sections | Static config in `lib/homeContent.ts`                 |

Static sections will move to API-backed once dedicated `/homepage/*` endpoints
land in `gum_api`.

## Theme

| Token        | Value                                       |
| ------------ | ------------------------------------------- |
| brand-500    | `#0ea5e9` (sky-500 — main brand)            |
| brand-600    | `#0284c7`                                   |
| accent       | `#6366f1`                                   |
| Heading font | Sora                                        |
| Body font    | Outfit                                      |
| Radius       | sm 10 · md 16 · lg 24 · xl 32               |

## Folder layout

```
app/             # App Router pages + layout
components/
├── layout/      # Header, Footer
├── home/        # 14 home page sections
└── ui/          # Button, Badge, CourseCard, Reveal, …
lib/             # api client, static content, utils
```
