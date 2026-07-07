# Bix Booking API

Multi-tenant booking/scheduling backend for **Bix Booking** — a REST API for
service businesses (reference tenant: *Big Cadi VIP*, a luxury chauffeur &
yacht operator with 6 staff).

**Stack:** Node + TypeScript + Fastify + PostgreSQL (Prisma, driver adapters) +
Zod + JWT + Stripe + Vitest.

## Getting started

```bash
cp .env.example .env          # then fill in Stripe test keys if you need payments
docker compose up -d          # starts Postgres on localhost:5434
npm install
npm run migrate               # applies migrations
npm run seed                  # seeds the Big Cadi VIP reference workspace
npm run dev                   # starts the API on http://localhost:4000
```

Seeded login (workspace slug `big-cadi-vip`):

| Role  | Email                     | Password      |
|-------|---------------------------|---------------|
| owner | cadi@bigcadivip.com       | password123   |
| staff | damon@bigcadivip.com      | password123   |

```bash
curl -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d \
  '{"slug":"big-cadi-vip","email":"cadi@bigcadivip.com","password":"password123"}'
```

## Scripts

| Command              | What it does                                      |
|-----------------------|----------------------------------------------------|
| `npm run dev`         | Start the API with hot reload (tsx watch)          |
| `npm run build`       | Type-check and compile to `dist/`                  |
| `npm start`           | Run the compiled server                            |
| `npm run migrate`     | Apply Prisma migrations (dev)                      |
| `npm run migrate:deploy` | Apply migrations non-interactively (CI/prod)    |
| `npm run generate`    | Regenerate the Prisma client                       |
| `npm run seed`        | Seed the Big Cadi VIP reference workspace          |
| `npm test`            | Run the Vitest suite (availability engine, etc.)   |
| `npm run typecheck`   | `tsc --noEmit`                                     |

## Architecture notes

- **Multi-tenancy.** Every row that belongs to a business hangs off a
  `Workspace` via `workspaceId`. Rather than repeating `where: { workspaceId }`
  in every query, `src/lib/prisma.ts` wraps the Prisma client in a
  [client extension](https://www.prisma.io/docs/orm/prisma-client/client-extensions)
  that auto-injects the current tenant's `workspaceId` into every read/write
  on tenant-scoped models. The tenant is bound once per request — in the
  `authenticate` preHandler for authenticated routes, or right after a public
  route resolves a workspace by slug — via `AsyncLocalStorage`
  (`src/lib/tenantContext.ts`). A second, unscoped `rawPrisma` export exists
  for the handful of places that legitimately need to look across tenants
  (login/registration by slug, the Stripe webhook, the seed script).

- **Availability engine** (`src/modules/availability/engine.ts`) is a pure,
  dependency-free function: given workspace hours, per-staff hours, time off,
  existing bookings, and buffer/lead-time/advance-window rules, it returns
  bookable slots. All interval math happens in UTC epoch milliseconds;
  `timezone.ts` handles the one genuinely tricky part — converting a
  workspace's local wall-clock working hours into the correct UTC instant on
  a given calendar date, including across DST transitions. It's covered by
  the test suite in `tests/availability.test.ts` (buffer overlap, DST
  boundaries, back-to-back bookings, lead-time cutoffs, blackout dates, and
  more).

- **Booking creation is race-safe.** `POST /public/:slug/bookings` (and the
  authenticated create/reschedule paths) validate the flow, then open a
  transaction that takes `SELECT ... FOR UPDATE` on the staff row before
  re-checking for conflicts and inserting — so two people booking the same
  slot at the same instant can't both win.

- **Payments.** A `PaymentPolicy` of `deposit`/`full` creates a Stripe
  PaymentIntent and leaves the booking `pending`; `none` confirms
  immediately. `POST /webhooks/stripe` verifies the signature against the raw
  request body (scoped content-type parser, so it doesn't affect JSON parsing
  elsewhere) and confirms the booking on `payment_intent.succeeded`.

- **Notifications** are behind a small interface (`src/lib/notifications.ts`)
  with a console/no-op adapter wired to `booking.created` /
  `booking.confirmed` / `booking.cancelled` domain events
  (`src/lib/events.ts`) — swap in a real email/SMS adapter without touching
  booking logic.

- **Errors** are always `{ error: { code, message, details? } }`
  (`src/lib/errors.ts`), and every route validates input with Zod
  (`src/lib/validate.ts`) before touching the database.

## API surface

All routes except `/auth/*` and `/public/*` require `Authorization: Bearer <accessToken>`.

- `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me`
- `GET|POST|PATCH|DELETE /services`, `GET|PUT /services/:id/staff`
- `GET|POST|PATCH|DELETE /addons`
- `GET|POST|PATCH|DELETE /staff`, `PUT /staff/:id/working-hours`, `POST|DELETE /staff/:id/time-off`
- `GET|PUT /flow`
- `GET|PUT /availability-rules`, `GET|PUT /payment-policy`, `GET|PUT /cancellation-policy`
- `GET|POST|PATCH|DELETE /clients`
- `GET /availability?serviceId&staffId&from&to` (also `GET /public/:slug/availability`)
- `GET /bookings`, `GET /bookings/:id`, `POST /bookings`, `PATCH /bookings/:id/status`,
  `POST /bookings/:id/cancel`, `POST /bookings/:id/reschedule`
  (also `POST /public/:slug/bookings`)
- `GET /dashboard/stats?date=`
- `GET|PATCH /workspace/setup-state`
- `POST /webhooks/stripe`

`/auth/*` and `/public/*` carry tighter per-route rate limits than the
authenticated API (see each route's `config.rateLimit`).

## Testing

```bash
npm test
```

The suite focuses on the availability engine, since that's where subtle bugs
hide: buffer overlap, DST spring-forward, back-to-back bookings with zero
buffer, lead-time cutoffs, max-advance-window, blackout dates, time off, slot
granularity, and per-staff isolation.

## Deploying

A `Dockerfile` is included and builds/runs cleanly against any Postgres —
see [`DEPLOYMENT.md`](../DEPLOYMENT.md) at the repo root for env vars and
the full deploy checklist (covers the frontend too). CI (`.github/workflows/ci.yml`)
runs typecheck, tests, migrations, and both builds on every push.
