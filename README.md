# SPANDIC

SPANDIC is an early-stage, creator-first social platform. The repository now contains a Next.js App Router + TypeScript homepage foundation, while the original `index.html` remains preserved as a static reference prototype.

## Current status

- `app/page.tsx` and `app/globals.css`: responsive social homepage and browser-only demo interactions.
- `app/layout.tsx`: app shell and metadata.
- `AUDIT.md`: verified starting-state audit and prioritized backlog.
- `PRODUCT_AND_ENGINEERING_PLAN.md`: product principles and long-term architecture.
- Real accounts, shared/persistent posts, database, server-backed likes/follows/comments, secure media storage, messaging, notifications and moderation are **not implemented yet**.

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

The repository does not yet include a generated npm lockfile; run `npm install` and commit the generated `package-lock.json` before treating dependency installation as fully reproducible.

## Environment variables

`.env.example` lists placeholder names for possible future Supabase integration. Supabase is **not connected yet**. Do not put real keys in Git. Never expose a service-role key in browser code.

## Product roadmap

1. Verify build, lint, type-check, responsive behavior and Vercel deployment.
2. Add Supabase Auth, PostgreSQL schema, migrations and restrictive Row Level Security.
3. Implement real profiles, persistent posts, likes, comments, follows and saves.
4. Add search/discovery, image storage, Stories/Reels, messaging and notifications.
5. Add reporting, blocking, moderation, observability, backups and load testing.

Do not label demo state as production-ready or claim 100K+ user capacity until load tests and infrastructure/cost measurements support it.
