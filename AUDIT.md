# SPANDIC Repository Audit

**Audit date:** 2026-10-13  
**Repository:** Shubhambhatupatil/Spandic  
**Branch inspected:** main  
**Purpose:** Record the verified starting point before implementing the next feature.

## Executive summary

SPANDIC is currently a single-file static HTML/CSS/JavaScript prototype, not yet a full-stack social network. The visual feed and some browser-only interactions exist. Real accounts, shared/persistent data, database, media hosting, and backend authorization are not implemented in the checked-in files.

This is a source review of the GitHub files. A browser session, local runtime, automated build, and end-to-end tests were not run during this audit.

## Files found on main

- index.html — approximately 11 KB; contains the complete current UI, CSS, demo posts, and inline JavaScript.
- README.md — currently only contains the heading “# Spandic”.
- PRODUCT_AND_ENGINEERING_PLAN.md — product principles, proposed architecture, roadmap, and engineering rules.

No package.json, lockfile, TypeScript configuration, framework configuration, database migrations, .env.example, .gitignore, automated test files, or GitHub Actions workflow files were present in the repository tree inspected.

## What is present in the prototype

- Responsive dark-themed layout with navigation, search input, stories strip, post composer, example posts, and creator suggestions.
- CSS layout changes for mobile-width screens.
- Like-count changes in the browser.
- Follow-button label toggle in the creator-suggestions panel.
- Text-only post creation in the current browser page.
- Local image/video file preview using a browser object URL.
- Explicit UI notes that several capabilities are previews and that local media is not uploaded.

## What is not implemented or not verified

| Area | Status | Evidence / next requirement |
|---|---|---|
| Real sign-up, sign-in, sign-out, password reset | Not implemented | Login buttons show informational alerts; no auth provider or server flow is wired in the source. |
| User profiles and account settings | Not implemented | Example initials/names are hard-coded demo content. |
| Database and schema migrations | Not present | No database client, schema, or migration files found. |
| Persistent posts and shared feed | Not implemented | New text posts are inserted into the current DOM only; no save/API call. |
| Server-backed likes, comments, saves, follows | Not implemented | UI-only state or placeholder alerts. |
| Search and Explore | Placeholder | Entering a search term shows an alert instead of returning results. |
| Stories and Reels | Visual placeholder/local preview only | No story expiry/privacy, persistent media upload, video processing, or streaming integration. |
| Messaging and notifications | Not implemented | Navigation labels only. |
| Report, block, moderation, account deletion | Not implemented | No safety APIs or moderation workflow. |
| Backend authorization, rate limiting, abuse protection | Not implemented | No server/API or database policy files found. |
| Build, lint, type checking, automated tests | Not configured / not run | No package scripts or test setup present; static HTML does not require a JavaScript framework build to be served. |
| Deployment | Partially evidenced | GitHub reports a successful Vercel status check on the latest roadmap commit, but this audit did not verify the live URL, domain, or current production deployment. |
| 100K+ user readiness | Not established | No load tests, metrics, capacity plan, or production backend currently exists. |

## Recommended implementation approach

Do not start by rewriting the current UI blindly. Keep the existing prototype as a reference and introduce a small, tested application foundation. The longer-term direction in PRODUCT_AND_ENGINEERING_PLAN.md is Next.js App Router + TypeScript with Supabase Auth/Postgres/RLS, object storage for images, and a dedicated video delivery/transcoding service when Reels are implemented.

Before adding auth or database code, select and verify the application structure and exact deployment/build requirements. Never commit real secrets, disable database row-level security, or present fixture data as real users.

## Ordered backlog

### P0 — Foundation and deployment
1. Confirm the intended runtime and deployment root. Keep the current prototype available as reference.
2. Establish the chosen framework/tooling only if needed; add minimal scripts, lockfile, lint/type-check/test setup appropriate to it.
3. Add a useful README, .gitignore, and .env.example with placeholder names only.
4. Add a smoke test and verify a production build plus deployment. Record actual outputs.

### P1 — Real identity and data foundation
5. Set up Supabase project configuration and checked-in SQL migrations.
6. Implement sign-up, sign-in, sign-out, password reset, profile setup, and protected routes.
7. Add database schema and restrictive RLS policies for profiles and posts; test that users cannot access or edit unauthorized records.

### P2 — First complete social vertical slice
8. Implement creating, viewing, editing, and deleting one's own text/image posts with server-side validation and persistent storage.
9. Implement paginated feed, likes, comments, follows, and saves against real persisted data.
10. Add search/discovery and basic notifications only after authentication and authorization work.

### P3 — Media, safety, and scale
11. Implement media upload with file-size/type controls and private/semi-public storage rules; use a dedicated video service/CDN for Reels.
12. Add report/block, moderation workflow, rate limits, spam controls, privacy and account-deletion flows.
13. Add integration/end-to-end tests, accessibility checks, dependency/security checks, monitoring, backups, and load tests before making any scale claims.

## Validation performed

- Inspected the GitHub repository metadata, the recursive main tree, index.html, README.md, and PRODUCT_AND_ENGINEERING_PLAN.md.
- Reviewed the inline JavaScript and the placeholder messages in the current prototype.
- Checked GitHub's combined status for the latest roadmap commit; a Vercel status context reported success. A successful status check alone does not prove that all social features work.
- Did not run a local browser, framework build, unit tests, accessibility scanner, security scanner, or load test. No such project scripts or test setup were present in the inspected tree.

## Next step

Complete P0 only, with minimal changes and explicit verification. Do not build all social features in one generated change.


## Additional prototype defects found during code review

- **Brand spelling in the original prototype:** an earlier version rendered “SPANDANIC”. This was corrected in `index.html` on 2026-10-13; the active Next.js header and metadata use “SPANDIC”. Keep the name consistent in any future UI changes.
- **Like-count parsing:** the like handler strips punctuation from labels such as “2.4k”, turning it into 24 before incrementing. Do not preserve this counter logic; use a proper integer count for demo labels or replace it with real database counts later.
- **Navigation is mostly decorative:** the Explore, Reels, Messages, Notifications, and Profile labels do not navigate to working routes.
- **Save is cosmetic:** the Save button only changes its label and does not persist a saved-post relationship.
- **Local media preview lifecycle:** object URLs are created for selected files but are not explicitly revoked. Clean them up when the preview is removed or the page lifecycle ends.
