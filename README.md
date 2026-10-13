# SPANDIC

SPANDIC is an early-stage global social-platform project. The current implementation is a static HTML/CSS/JavaScript prototype; real accounts, persistent posts, database-backed social actions, and media hosting are not implemented yet.

## Current status

- The UI prototype is in `index.html`.
- The verified starting-state audit and prioritized backlog are in `AUDIT.md`.
- Product principles and proposed long-term architecture are in `PRODUCT_AND_ENGINEERING_PLAN.md`.

## Preview locally

The current prototype does not require Node.js or a package installation.

1. Open `index.html` in a modern browser, or serve the repository directory with any simple static file server.
2. Try the demo interactions. They are browser-only; newly created posts and selected media do not sync to a server or other users.
3. Do not treat the demo names and posts as real accounts or user-generated content.

## Planned engineering direction

The proposed target is Next.js App Router + TypeScript with Supabase Auth/PostgreSQL/Row Level Security. Image storage and video delivery need proper server/storage integration. The framework migration and backend are not yet complete; check `AUDIT.md` for verified status and next steps.

## Development rules

- Work in this repository and the `main` branch unless a reviewed change specifically requires otherwise.
- Never commit passwords, access tokens, service-role keys, or populated local environment files.
- Do not disable database Row Level Security as a shortcut.
- Do not label placeholder interactions as production-ready.
- Do not claim 100K+ user capacity until load tests and infrastructure/cost measurements support it.
