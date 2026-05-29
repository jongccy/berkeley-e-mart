# Berkeley E-Mart

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

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_storage_and_phase2.sql`](supabase/migrations/002_storage_and_phase2.sql)
   - [`supabase/migrations/003_auth_fixes.sql`](supabase/migrations/003_auth_fixes.sql) — signup + Google auth fixes
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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the same environment variables (use your production URL for `NEXT_PUBLIC_SITE_URL`).
4. In Supabase Auth settings, add your Vercel URL to redirect URLs.

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
