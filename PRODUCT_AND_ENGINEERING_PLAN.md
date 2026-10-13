# SPANDIC — Engineering Charter

SPANDIC is a global social platform for people and creators worldwide. Build a genuinely usable product, not a static mockup. Keep this repository and the `main` branch; do not create a second repo or replace working features without checking them first.

## Product principles
- Global by default: accessible, mobile-first, localization-ready, privacy-respecting.
- Distinctive product identity: calm dark UI with warm coral/orange accents, strong creator discovery, language-aware discovery, and community spaces. Do not copy Instagram's branding/assets.
- Honest UI: never label demo data as real users; never claim an operation succeeded unless it did.
- Accessibility: semantic HTML, keyboard support, visible focus, contrast, reduced-motion support.
- Security first; no secrets committed to Git.

## Target architecture
- Next.js App Router + TypeScript + React; strict TypeScript.
- Supabase Auth + PostgreSQL + Row Level Security for accounts and relational data.
- Supabase Storage or a suitable object-storage provider for images. Video delivery/transcoding should use a dedicated service/CDN; do not proxy large videos through app serverless functions.
- Server-side validation and authorization for every mutation. Environment variables for public config; never expose service-role secrets to browsers.
- Paginated feeds, indexed queries, rate limiting, abuse controls, observability, backups, and migrations.
- Deploy on Vercel when account permissions allow. Free tiers are for development/early tests, not a promise of 100K-user production capacity.

## Feature roadmap (implement in small tested PRs/commits)
1. Inspect repository, report its existing state, add app shell, shared layout, responsive navigation, error/loading/empty states.
2. Authentication: sign-up, sign-in, sign-out, password reset, profile setup, protected routes.
3. Database migrations and RLS for profiles, posts, media metadata, follows, likes, comments, saves, notifications, blocks, reports.
4. Real feed with pagination; create/edit/delete own posts; image uploads; likes/comments/follows/saves persisted in database.
5. Stories with expiry and privacy settings.
6. Reels: vertical feed, playback controls, captions, mute, creator follow, likes/comments/saves/report; upload to object storage and use a dedicated transcoding/streaming service. Never pretend local preview is an upload.
7. User/post search, notifications, messaging only after permissions and abuse protections are implemented.
8. Safety: report/block, rate limits, spam controls, content policy, admin moderation audit trail, account deletion/export and privacy controls.
9. Quality: unit/integration/e2e tests, accessibility checks, dependency/security scan, performance profiling, load-test plan.
10. Production readiness: CDN/cache strategy, database indexes, connection pooling, queue/background jobs, backups/restore drills, monitoring/alerts, incident plan, privacy/legal review, staged rollout.

## Required working rules
- First inspect all files and the current build setup. Do not assume the repository is empty.
- Do not create fake functionality or hard-coded pretend accounts in production screens. Clearly label fixtures as demo data.
- Implement the smallest complete vertical slice at a time. Run lint, typecheck, tests and production build; fix failures before claiming done.
- Add/update README with exact setup, environment variable names (never values), migrations, tests and deployment steps.
- Add `.env.example` with placeholder names only; ensure secrets are ignored by Git.
- Use database migrations and RLS policies checked into the repo. Never disable RLS as a shortcut.
- Avoid expensive paid services by default; explain any service whose free tier is insufficient.
- Do not promise support for 100K+ users until architecture is load-tested and bottlenecks/costs are measured.
- Keep commits focused and summarize files changed, tests run, known limitations, and next step.
