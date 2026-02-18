# CVKiko

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

A modular CV/resume builder where your professional information lives as reusable **bricks** and your CV can be explored as an interactive 2D town you navigate with a **car**.

## Features

### Bricks — Modular CV Building Blocks

Bricks are reusable units of professional content. Create them once, then mix and match across multiple tailored CVs.

| Brick Type | Description |
|---|---|
| **Experience** | Work history with responsibilities, achievements, and technologies |
| **Education** | Degrees, certifications, GPA, honors, and coursework |
| **Project** | Personal and professional projects with features, tech stack, and links |
| **Skill** | Technical skills, languages, and tools with proficiency levels |
| **Publication** | Papers, articles, books, and patents |
| **Custom** | Free-form markdown for anything else |

### Interactive Preview — The Car

Instead of a static PDF, explore your CV as a **2D game world** built with PixiJS. Drive a red car through a procedurally generated town where each brick type has its own district with buildings you can visit. Skills appear as small booths in a grid. Drive into a zone and a card slides in showing the full content.

- WASD / Arrow key controls (keyboard)
- Touch joystick controls (mobile)
- Smooth camera follow
- Procedural town layout with roads, trees, and street lights

### AI Job Matching

Paste a job description and an AI assistant analyzes it against your bricks, recommending which ones to include and flagging skill gaps. One-click to apply the suggestions.

Supports three providers:
- **Groq** — free tier (14,400 requests/day, Llama 3.3 70B)
- **Cloudflare Workers AI** — free tier (Llama 3.1 8B)
- **Anthropic Claude** — paid (Claude 3.5 Sonnet)

### CV Builder

Three-panel interface: select bricks on the left, preview the assembled CV in the center, and chat with the AI assistant on the right.

### Export & Share

- **PDF export** via jsPDF
- **Browser print** (Ctrl+P)
- **Shareable links** — save a CV configuration with a unique slug and share the public URL

## Tech Stack

- **Framework:** Nuxt 4 + Vue 3 + TypeScript
- **UI:** Nuxt UI v4 + Tailwind CSS v4
- **Database:** SQLite via Drizzle ORM + libSQL
- **2D Engine:** PixiJS v8
- **AI:** Vercel AI SDK with multi-provider support
- **PDF:** jsPDF
- **Deployment:** Cloudflare Pages

## Setup

### Prerequisites

- Node.js 18+
- pnpm

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Copy the example file and fill in your chosen AI provider credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | Yes | `cloudflare`, `groq`, or `anthropic` |
| `CLOUDFLARE_ACCOUNT_ID` | If using Cloudflare | Cloudflare dashboard > Account ID |
| `CLOUDFLARE_API_TOKEN` | If using Cloudflare | API token with Workers AI access |
| `GROQ_API_KEY` | If using Groq | From [console.groq.com](https://console.groq.com/) |
| `ANTHROPIC_API_KEY` | If using Anthropic | From [console.anthropic.com](https://console.anthropic.com/) |

### Database

```bash
pnpm db:push
```

## Development

```bash
pnpm dev
```

Runs on `http://localhost:3000`.

## Production

```bash
pnpm build
```

Preview locally:

```bash
pnpm preview
```

Deploy to Cloudflare Pages:

```bash
pnpm deploy
```

## License

[MIT](./LICENSE)
