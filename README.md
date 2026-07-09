# Calket

A marketplace for UC Berkeley students to buy and sell items, services, and housing leases. Only verified `@berkeley.edu` accounts can create listings, post requests, and message other users.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Postgres, Auth, Storage, Realtime

## Features

### MVP

- Sign up / log in with `@berkeley.edu` email verification
- Listings: items, services, housing leases (with photos)
- Browse, search, and filter listings
- User profiles with avatar and bio
- In-app chat (realtime) per listing inquiry
- Inbox with conversation history

### Phase 2 (included)

- **Requests board** (`/wanted`) — post what you're looking for
- **Sold history** on profile (`?tab=sold`)
- **Recommendations** on home feed based on recently viewed listings

## Setup

### 1. Supabase project

Use a fresh Supabase project for Berkeley data. For launch, keep development
and production separate if possible:

- `calket-dev` for local testing and fake listings
- `calket-prod` for real Berkeley users and marketplace data

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_storage_and_phase2.sql`](supabase/migrations/002_storage_and_phase2.sql)
   - [`supabase/migrations/003_auth_fixes.sql`](supabase/migrations/003_auth_fixes.sql) — signup + Google auth fixes
   - [`supabase/migrations/004_realtime_messages.sql`](supabase/migrations/004_realtime_messages.sql) — live chat updates
   - [`supabase/migrations/005_seller_display.sql`](supabase/migrations/005_seller_display.sql) — anonymous/nickname seller display
   - [`supabase/migrations/006_profile_marketplace_identity.sql`](supabase/migrations/006_profile_marketplace_identity.sql) — profile alias toggle
   - [`supabase/migrations/007_remove_type_and_recategorize.sql`](supabase/migrations/007_remove_type_and_recategorize.sql) — remove type, new categories
   - [`supabase/migrations/008_listing_quality_rating.sql`](supabase/migrations/008_listing_quality_rating.sql) — quality rating, remove anonymous seller mode
   - [`supabase/migrations/009_listing_tags.sql`](supabase/migrations/009_listing_tags.sql) — listing tags
   - [`supabase/migrations/010_wanted_conversations.sql`](supabase/migrations/010_wanted_conversations.sql) — message requesters on wanted posts
3. In **Storage**, create two **public** buckets:
   - `listing-images`
   - `avatars`
4. In **Authentication → URL configuration**, set:
   - Site URL: `http://localhost:3000` (or your production URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. Enable **Email** provider and confirm emails (enabled by default).
6. **Google sign-in (optional):** Authentication → Providers → **Google** → Enable. Create [Google OAuth credentials](https://console.cloud.google.com/apis/credentials), set redirect URI to `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`, paste Client ID/Secret into Supabase.
7. Copy **Project URL** and **anon key** from Settings → API.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Demo listing (another seller)

To preview someone else's listing (teak armchair example with seller bio and photo):

1. In Supabase **Settings → API**, copy the **service_role** key (keep it secret).
2. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run:

```bash
npm run seed:demo
```

4. Open the printed URL, or go to:

`http://localhost:3000/listings/b0000000-0000-4000-8000-000000000001`

This creates a demo seller **Homestead Furnishings** (`demo.seller@berkeley.edu`) — not your account — so you can test viewing another person's listing, seller info, and messaging.

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

### Minimum (Hobby — start here)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add these **three** environment variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase **Project URL** (`https://….supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase **anon public** key
   - `NEXT_PUBLIC_SITE_URL` — your Vercel URL, e.g. `https://your-app.vercel.app`
4. In Supabase → **Authentication → URL Configuration**, set **Site URL** and add redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`
5. Run Supabase migrations `001`–`024` in the SQL editor if you have not already.

No cron, service role, or email keys are required for the core marketplace to work.

### Scale up later (when traffic grows)

Add these when you want automated sold-listing cleanup and optional email alerts:

- **`CRON_SECRET`** — random string you generate (`openssl rand -hex 32`)
- **`SUPABASE_SERVICE_ROLE_KEY`** — Supabase service role key (server-only)
- Re-enable the cron in `vercel.json` (daily on Hobby: `"schedule": "0 0 * * *"`)
- **`RESEND_API_KEY`** + **`EMAIL_FROM`** — optional new-message emails

Sold listings are hidden from browse after 24 hours via query filters even before cron is enabled; cron archives them in the database in the background.

## Smoke test checklist

1. Sign up with `you@berkeley.edu` and verify email from inbox.
2. Create a listing with photos at `/listings/new`.
3. Log in as another verified user → open listing → **Message seller**.
4. Send messages and confirm they appear in `/inbox` in realtime.
5. Mark listing sold → see it under profile **Sold history**.
6. View several listings → see **Recommended for you** on home.
7. Post a request at `/wanted/new` and browse `/wanted`.

## Project structure

```
src/
  app/           # Routes and server actions
  components/    # UI components
  lib/           # Supabase clients, auth helpers, formatting
  types/         # TypeScript types
supabase/
  migrations/    # SQL schema + RLS
```

## Security notes

- Seller emails are never shown; use in-app chat only.
- For leases, use neighborhood-level `address_area` in listings; share exact address in chat if needed.
- Row Level Security enforces verified Berkeley users for writes.
