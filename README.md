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
