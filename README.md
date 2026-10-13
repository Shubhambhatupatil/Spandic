# SPANDIC

SPANDIC is an early-stage, creator-first social platform. The repository contains a Next.js App Router + TypeScript homepage foundation, while the original `index.html` remains preserved as a static reference prototype.

## Current status

- `app/page.tsx` and `app/globals.css`: responsive social homepage and browser-only demo interactions.
- `supabase/migrations/202610130001_initial_schema.sql`: initial PostgreSQL schema for profiles, posts, follows, likes, comments, saves, stories and notifications, with Row Level Security policies.
- `AUDIT.md`: starting-state audit and prioritized backlog.
- `PRODUCT_AND_ENGINEERING_PLAN.md`: product principles and long-term architecture.
- Real accounts, database connection from the app, server-backed social actions, secure media storage, messaging and deployed moderation workflows are **not connected/implemented yet**. The SQL migration has been committed but has not been applied to a Supabase project.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify before deployment

```bash
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs lint, type-check and production build on pushes and pull requests. A generated npm lockfile is still outstanding; create and commit `package-lock.json` before treating dependency installation as fully reproducible.

## Supabase migration

1. Create a Supabase project you control.
2. Install the Supabase CLI and link the project locally.
3. Review `supabase/migrations/202610130001_initial_schema.sql`.
4. Apply it with `supabase db push` after linking the intended project.
5. Configure app environment variables from `.env.example` in your local environment and hosting dashboard. Never commit real credentials.

The migration enables Row Level Security on all user-facing tables and adds ownership-based policies. It is versioned in Git but has **not** been applied or integration-tested against a live database. Do not put a service-role key in browser code.

## Product roadmap

1. Keep CI green and verify responsive behavior and deployment.
2. Connect Supabase Auth and database access safely.
3. Implement real profiles, persistent posts, likes, comments, follows and saves.
4. Add search/discovery, image storage, Stories/Reels, messaging and notifications.
5. Add reporting, blocking, moderation, observability, backups and load testing.

Do not label demo state as production-ready or claim 100K+ user capacity until load tests and infrastructure/cost measurements support it.
