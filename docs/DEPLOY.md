# Deploying DowgNut to Vercel

DowgNut is a Next.js 16 app. It deploys to Vercel out of the box. Two things to know:

1. **Database** — the default SQLite setup runs on Vercel's **ephemeral `/tmp`** filesystem. The app auto-creates the schema and re-seeds the 21 donuts on every cold start (handled by `src/lib/ensure-ready.ts`). This is perfect for a **demo/showcase** — browsing, cart, checkout, AI tools all work. The trade-off: cart/orders/reviews reset when the serverless instance cold-starts. For **persistent** storage, switch to Vercel Postgres (see below).

2. **Real-time order tracking** — the WebSocket mini-service (`mini-services/order-tracking/`, port 3004) **cannot run on Vercel** (Vercel is serverless — no long-running processes). The order-tracking screen has a built-in REST polling fallback, so the UI still loads and shows the last-known order status. To get live progressing status, deploy the mini-service separately (Render / Railway / Fly.io) and point the frontend at it.

---

## Option A — One-click demo deploy (ephemeral SQLite, no setup)

1. Push this repo to GitHub (already at `https://github.com/thisisniagahub/Dowgnut-Z.git`).
2. Go to **https://vercel.com/new** → import the `Dowgnut-Z` repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `bun run build` (from `vercel.json`).
5. Install command: `bun install` (from `vercel.json`).
6. **No environment variables required** — the SQLite path is auto-resolved to `/tmp/dowgnut.db`.
7. Click **Deploy**. Wait ~2 min.

That's it. The first request to `/api/donuts` lazily creates the schema + seeds 21 donuts.

> The `postinstall` script runs `prisma generate` so the Prisma Client is built during install.

---

## Option B — Production deploy with persistent Postgres

Use this if you want cart/orders/reviews to survive cold starts.

### 1. Create a Postgres DB
Easiest: **Vercel Postgres** (free tier) — in your Vercel project dashboard → **Storage** → **Create** → **Postgres**. Copy the `DATABASE_URL` (the pooled/`?pgbouncer=true` one works).

Alternatives: **Neon** (https://neon.tech) or **Supabase** (https://supabase.com) — both have free Postgres tiers.

### 2. Switch the Prisma provider
Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Then regenerate:

```bash
bun run db:generate
```

### 3. Set the env var
- **Locally**: put `DATABASE_URL="postgresql://..."` in `.env`.
- **On Vercel**: Project Settings → Environment Variables → add `DATABASE_URL` (paste the Postgres URL).

### 4. Create tables + seed
```bash
bun run db:push      # creates tables in Postgres
bun run seed         # inserts 21 donuts (idempotent)
```

### 5. Deploy
Push to `main` — Vercel auto-deploys. The `src/lib/ensure-ready.ts` module becomes a harmless no-op (tables already exist, catalog already seeded).

---

## 🔐 Secret Rotation Protocol

These credentials live in `.env` (gitignored) and must be present in production. Rotate them every 90 days or whenever team membership changes.

| Variable | Purpose | Rotate via | Frequency |
|---|---|---|---|
| `NEXTAUTH_SECRET` | JWT signing | `openssl rand -base64 32` | 90 days |
| `DATABASE_URL` | Postgres connection | Vercel/Neon/Supabase dashboard | 90 days |
| `SENANGPAY_MERCHANT_ID`, `SENANGPAY_SECRET_KEY`, `SENANGPAY_VERIFY_KEY` | Payment gateway | SenangPay dashboard | 90 days |
| `HERMES_API_KEY` | Hermes Agent auth | Hermes console | 30 days |

**Rotation steps:**
1. Generate new value (`openssl rand -base64 32` for secrets, or copy from provider)
2. Update `.env` locally + `.env.production` reference
3. Push to Vercel env (`vercel env pull` to sync)
4. Redeploy → NextAuth handles token invalidation, DB connections migrate, payment keys swap atomically
5. Revoke old credential in source dashboard (SenangPay, Hermes)

**Critical:** never commit `.env` values to git, never paste in chat/screenshots. See `.env.example` for placeholders.

---

## Real-time order tracking (optional, separate host)

The WebSocket service lives in `mini-services/order-tracking/`. To run it:

1. Deploy `mini-services/order-tracking/` to **Render** (free Web Service), **Railway**, or **Fly.io**. It's a standalone Bun + socket.io server on port 3004.
2. Update the frontend connection string in `src/components/dowgnut/order-tracking-view.tsx`:
   - Currently: `io("/?XTransformPort=3004", …)` (works behind the local Caddy gateway).
   - For production: `io("https://your-tracking-service.onrender.com", { transports: ["websocket","polling"] })`.
3. The tracking screen falls back to REST polling (`/api/orders/[id]`) if the socket can't connect, so it never breaks.

---

## Local dev

```bash
bun install
bun run db:push      # create local SQLite schema
bun run seed         # seed 21 donuts
bun run dev          # http://localhost:3000
```

To also run real-time tracking locally:

```bash
cd mini-services/order-tracking
bun install
bun run dev          # port 3004
```

---

## What's in this repo

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router — single `/` route (SPA) + `/api/*` routes |
| `src/lib/db.ts` | Prisma client — auto-resolves `/tmp` on Vercel |
| `src/lib/ensure-ready.ts` | Auto schema-create + seed on cold start (Vercel) |
| `src/lib/seed-data.ts` | Shared 21-donut catalog |
| `prisma/schema.prisma` | DB schema (SQLite default; switch to postgres for persistence) |
| `prisma/seed.ts` | Seed script (`bun run seed`) |
| `vercel.json` | Vercel build config |
| `mini-services/order-tracking/` | Standalone socket.io service (deploy separately) |
| `public/brand/` | Logo + brand images |

---

## Troubleshooting

**Build fails on Vercel with Prisma error** — ensure `postinstall: prisma generate` is in `package.json` (it is). If still failing, add `prisma generate` explicitly to the build command.

**`/api/donuts` returns 500 on Vercel** — check Vercel function logs. The `ensure-ready` raw DDL should create tables; if it fails, the SQLite /tmp may be full. Redeploy.

**Orders disappear after a while** — that's the ephemeral SQLite cold-start reset. Use Option B (Postgres) for persistence.

**Order tracking stuck on "preparing"** — the WebSocket service isn't running. Either deploy it separately (see above) or rely on the REST polling fallback (shows last-known status only).
