# Deploying Bix Booking

Two independently deployable pieces:

- **`server/`** — Fastify API. Needs a long-running Node process (or a
  container) plus a managed Postgres database. A `Dockerfile` is included
  and works on any container host (Render, Railway, Fly.io, Cloud Run, ECS,
  etc.) — this doc is intentionally provider-agnostic since that choice is
  yours.
- **`/`** (repo root) — the React admin dashboard + public booking page.
  Builds to a static `dist/` folder; deploy it anywhere that serves static
  files (Vercel, Netlify, Cloudflare Pages, S3+CloudFront).

## 1. Database

Provision a Postgres instance (Neon, Supabase, RDS, Railway's Postgres,
etc.) and get its connection string.

## 2. Backend

**Environment variables** (see `server/.env.example`):

| Var | Notes |
|---|---|
| `DATABASE_URL` | From step 1 |
| `NODE_ENV` | `production` |
| `PORT` | Whatever your host expects (many inject this themselves) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random values — **not** the dev placeholders in `.env.example` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Skipped for now per your call — bookings requiring payment will fail cleanly (auto-cancelled with a clear error) until these are real |
| `PUBLIC_APP_URL` | The deployed frontend's URL |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call authenticated routes in production (falls back to `PUBLIC_APP_URL`). Public booking-widget routes always allow any origin regardless of this. |

**Build & release:**

```bash
docker build -t bix-booking-api server/
```

Run **once per deploy** (release/predeploy step, before starting the app):

```bash
npx prisma migrate deploy   # inside the image, or via `docker run --entrypoint ...`
```

**Start command:** `node dist/src/server.js` (this is the Docker image's
default `CMD`).

**Health check:** `GET /health` → `{"status":"ok"}`.

**Seeding the reference workspace** (optional, e.g. for a staging
environment): `npm run seed` — connects using `DATABASE_URL` from the
environment it's run in, so point it at the target database first.

## 3. Frontend

**Environment variable at build time:** `VITE_API_URL` — the backend's
deployed URL (e.g. `https://api.bigcadivip.com`). Falls back to
`http://localhost:4000` if unset, so don't forget to set it for prod builds.

```bash
VITE_API_URL=https://your-api-domain npm run build
```

Deploy the resulting `dist/` folder as a static site. If your host does
client-side routing for you (Vercel/Netlify), make sure unknown paths
rewrite to `/index.html` — this is a single-page app (`react-router`), so a
direct load of e.g. `/book/big-cadi-vip` needs to hit `index.html`, not 404.

## 4. Wire them together

1. Set the backend's `PUBLIC_APP_URL` / `ALLOWED_ORIGINS` to the frontend's real URL.
2. Set the frontend's `VITE_API_URL` to the backend's real URL, rebuild, redeploy.
3. Log in with the seeded owner account (`cadi@bigcadivip.com` / `password123`)
   and change the password / create real users before sharing the URL.

## 5. Stripe (when you're ready)

1. Get real keys from your processor's dashboard and set
   `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` on the backend.
2. Register a webhook endpoint pointing at
   `https://your-api-domain/webhooks/stripe`, subscribed to at least
   `payment_intent.succeeded`.
3. If you switch processors instead of using Stripe, the integration point
   is `server/src/lib/stripe.ts` (client) and the payment-intent creation
   in `server/src/modules/bookings/service.ts::createPublicBooking` — that's
   the only place that talks to a payment provider.

## Known gaps before this is fully production-ready

- Notifications (`server/src/lib/notifications.ts`) log to the console —
  swap in a real email/SMS provider by implementing the `Notifier` interface.
- No automated integration/e2e tests yet — only the availability engine has
  unit tests (`server/tests/`).
- No password-reset flow.
