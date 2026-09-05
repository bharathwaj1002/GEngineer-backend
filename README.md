# G Engineer — Hiring Task Platform (Backend)

NestJS + Prisma + PostgreSQL API for the G Engineer practical hiring-task platform. Pairs with the
[GEngineer-frontend](../GEngineer-frontend) React app.

## Stack

- NestJS + TypeScript
- PostgreSQL via Prisma ORM
- JWT auth (access + refresh) via httpOnly cookies
- Role-based access control (`ADMIN`, `CANDIDATE`) enforced server-side with Nest guards

## Setup

```bash
cp .env.example .env      # adjust if needed — defaults work with the docker-compose below
docker compose up -d      # starts PostgreSQL on localhost:5432
npm install
npm run prisma:migrate    # applies the schema (creates it on first run)
npm run seed              # creates dev accounts + sample candidates (see below)
npm run start:dev         # http://localhost:4000
```
0
## Prisma

```bash
npm run prisma:generate   # regenerate the client after editing schema.prisma
npm run prisma:migrate    # create + apply a new migration in development
npm run prisma:deploy     # apply existing migrations (CI/production)
npm run prisma:studio     # inspect the database in a browser
```

## Seed data (development only)

`npm run seed` creates:

| Account | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@gengineer.dev` | `ChangeMe123!` | Full access |
| Candidate | `candidate.oneday@gengineer.dev` | `ChangeMe123!` | 1-Day track, in progress, partially filled |
| Candidate | `candidate.twoday@gengineer.dev` | `ChangeMe123!` | 2-Day track, submitted, media-reviewed |

**These are development-only credentials — never reuse them anywhere real.** Override via the
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_CANDIDATE_PASSWORD` env vars if needed.

## Task content

The 1-Day and 2-Day hiring-task content (sections, fields, scoring) lives in
`src/tasks/definitions/*.ts` as versioned static config (`s1-v1`, `s2-v1`), not database rows — an
`Assignment.taskVersion` string is the only link, so future content edits ship as a new version
without altering historical submissions. It was ported field-for-field from the original prototype
at `../GEngineer-frontend/reference/g-engineer-hiring-task.html`.

## Architecture notes

- **Candidate endpoints never take a foreign ID.** Everything under `/me/...` resolves the
  candidate's own assignment/submission from their JWT — there is no `:assignmentId` a candidate
  could tamper with. Only `/me/submission/rows/:rowId` takes an ID, and it's guarded by
  `OwnRowGuard`, which 404s (not 403) on a mismatch.
- **Media review and evaluations are never serialized into a candidate's own submission payload**
  — enforced in `submissions.service.ts`, not just hidden in the frontend.
- Autosave is a debounced whole-blob `PATCH /me/submission/answers` (shallow merge) plus per-row
  endpoints for repeatable/link rows, which have stable database IDs (no array-index addressing).

## Known scope limits (not built in this pass)

Audit log, assignment calendar/timeline view, automated test suite, dashboard analytics/charts,
binary file uploads (links only), a task-version management UI, and rate limiting / advanced
security hardening beyond password hashing + JWT + RBAC + input validation.

## Deploying to Vercel

The app runs on Vercel as a serverless function — `api/index.js` boots the compiled Nest app
(`dist/src/serverless.js`, built from `src/serverless.ts`) once per cold start and reuses it across
warm invocations. `vercel.json` rewrites every path to that function, and `postinstall` runs
`prisma generate` so the Prisma Client is regenerated on Vercel's own build machine (needed since
`node_modules` isn't committed to git).

1. **Database — [Neon](https://neon.tech)**: create a project, then grab the **pooled** connection
   string (the one with `-pooler` in the hostname, or check "Connection pooling" in the Neon
   dashboard). Serverless functions open a fresh connection per invocation, so the pooled endpoint
   (PgBouncer) is required — the direct connection string will exhaust Postgres's connection limit
   under any real traffic.
2. **Import the repo**: in the Vercel dashboard, "Add New… → Project", pick `NUKEPC1/GEngineer-backend`.
   Framework preset can stay "Other" — `vercel.json` handles build/routing.
3. **Environment variables** (Project Settings → Environment Variables, for Production — and
   Preview if you want preview deploys to work too):
   - `DATABASE_URL` — the Neon pooled connection string from step 1
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — generate real random values, e.g. `openssl rand -hex 32`
   - `JWT_ACCESS_TTL="15m"`, `JWT_REFRESH_TTL="7d"`
   - `CORS_ORIGIN` — the frontend's production URL, e.g. `https://gengineer-frontend.vercel.app`
     (comma-separate multiple origins if needed)
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CANDIDATE_PASSWORD` — only needed if you run
     the seed script against production; use real values, not `ChangeMe123!`
4. **Deploy**, then apply the schema to the production database once (from your machine, with
   `DATABASE_URL` pointed at Neon):
   ```bash
   DATABASE_URL="<neon-pooled-url>" npm run prisma:deploy
   ```
   Run `npm run seed` the same way only if you actually want the sample dev accounts in production.
5. Note the backend's deployed URL (`https://<project>.vercel.app`) — the frontend needs it as
   `VITE_API_URL`.

Auth cookies are `SameSite=None; Secure` in production (see `auth.controller.ts`) since the
frontend and backend are on different Vercel domains — this requires both to be served over HTTPS,
which Vercel does by default.
