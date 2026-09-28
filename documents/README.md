# Support Escalation Hub

AI-powered customer support escalation system with autonomous agent analysis, KEDB integration, and real-time diagnostics.

## Features

- **Autonomous Agent** — Analyzes tickets, classifies by tier (1/2/3), and drafts empathetic responses or Tier-3 handover summaries
- **Project Inspector & Fixer** — Drop in a codebase and get a 3D code diagnosis (security audit, defect triage) with an automated code-repair engine
- **Support Queue** — Track Open, Resolved, and Escalated tickets; quick-resolve or escalate from the list; create new tickets
- **KEDB Library** — Known Error Database with search, categorization, and article creation
- **Setup Wizard** — Onboarding screen to configure Supabase and Gemini credentials, verified live before launch
- **Ingress Stream** — Real-time system telemetry and diagnostic log pipeline

## Prerequisites

- Node.js 20+
- A [Gemini API key](https://aistudio.google.com/apikey) (optional — the app ships a built-in local analysis engine so it runs keyless too)
- (Optional) A [Supabase](https://supabase.com) project for persistent storage

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If credentials aren't configured, the onboarding screen will walk you through them — or pick **Quick Start Mode** to explore without keys.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Gemini API key for agent analysis. Falls back to the local engine when unset |
| `SUPABASE_URL` | No | Supabase project URL (in-memory fallback if unset) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (reserved, not currently wired) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NODE_ENV` | No | Set to `production` to serve the built `dist/` instead of the Vite dev server |

Credentials can also be entered in-app via the Setup Screen or **Settings → Integrations**. Keys entered in the UI are kept in-memory for the session (re-enter after a server restart). Never commit real keys — `.env*` files are git-ignored.

## App Screens

- **Project Inspector & Fixer** (landing) — upload a repo or run diagnosis on the preset project; view security/vulns, defects, and auto-fix with AI or local fallback
- **Dashboard** — live queue health, SLA-style metrics, and recent activity
- **Active Queue** — searchable/filterable ticket list with a detail workspace and AI escalation
- **KEDB Library** — browse and add known-error articles
- **Ingress Stream** — scroll-through system telemetry and per-ticket log context
- **Settings** — connect Supabase, Gemini, and Stripe

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Set environment variables in the Vercel dashboard
3. Deploy — `vercel.json` handles routing automatically

### Manual Build

```bash
npm run build     # builds frontend + server
node dist/server.cjs   # serves production on :3000
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx server.ts` | Run dev server with hot-reload on :3000 |
| `build` | `vite build && esbuild server.ts` | Production build (frontend + server) |
| `start` | `node dist/server.cjs` | Serve the production build on :3000 |
| `lint` | `tsc --noEmit` | Type-check the whole project |

## Tech Stack

- React 19 + Tailwind CSS v4 + Motion
- Express (server-side API)
- Vite (dev server & build)
- Supabase (optional persistent storage)
- Gemini API (autonomous analysis, with local fallback engine)