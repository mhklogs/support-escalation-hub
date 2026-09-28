# support-escalation-hub — Architecture Summary

> Generated from static analysis on 2026-09-28.

## Components

| Layer | Present | Evidence |
| --- | --- | --- |
| Presentation / UI | yes | 0 route module(s), 17 component file(s) |
| API / server | yes | 0 handler(s), entrypoints: api/index.ts, server.ts, src/types/index.ts |
| Domain / business logic | unclear | no dedicated layer detected |
| Persistence | yes | @supabase/supabase-js |
| Authentication | no | none detected |

## Detected frameworks and libraries

| Package | Purpose (inferred) |
| --- | --- |
| `@supabase/supabase-js` | Supabase |
| `@tailwindcss/vite` | dependency |
| `@types/express` | dependency |
| `@types/node` | dependency |
| `@types/ws` | dependency |
| `@vitejs/plugin-react` | dependency |
| `autoprefixer` | dependency |
| `dotenv` | dependency |
| `esbuild` | esbuild |
| `express` | Express |
| `lucide-react` | dependency |
| `motion` | dependency |
| `react` | React |
| `react-dom` | React |
| `tailwindcss` | Tailwind CSS |
| `tsx` | dependency |
| `typescript` | dependency |
| `vite` | Vite |
| `ws` | dependency |

## Runtime and delivery

| Concern | Finding |
| --- | --- |
| Language mix | TypeScript, HTML, SQL, CSS |
| Package manager | npm |
| Container | none |
| Serverless / PaaS | Vercel configuration present |
| CI | none detected |
| Tests | **none detected** |
| Type safety | TypeScript |

## Environment variables referenced

- `DISABLE_HMR`
- `GEMINI_API_KEY`
- `NODE_ENV`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
