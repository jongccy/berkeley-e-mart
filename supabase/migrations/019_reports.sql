-- Reports for listings and users (feeds admin moderation queue in a later phase)

create type public.report_reason as enum (
  'scam',
  'inappropriate',
  'not_berkeley',
  'spam',
  'other'
);

create type public.report_status as enum (
  'pending',
  'reviewed',
  'dismissed'
);

create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (reporter_id, listing_id)
);

create index listing_reports_status_idx
  on public.listing_reports (status, created_at desc);

create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id),
  unique (reporter_id, reported_user_id)
);

create index user_reports_status_idx
  on public.user_reports (status, created_at desc);

alter table public.listing_reports enable row level security;
alter table public.user_reports enable row level security;

create policy "Authenticated users can submit listing reports"
  on public.listing_reports for insert
  with check (
    auth.uid() = reporter_id
    and public.is_authenticated_berkeley()
  );

create policy "Users can view own listing reports"
  on public.listing_reports for select
  using (auth.uid() = reporter_id);

create policy "Authenticated users can submit user reports"
  on public.user_reports for insert
  with check (
    auth.uid() = reporter_id
    and public.is_authenticated_berkeley()
  );

create policy "Users can view own user reports"
  on public.user_reports for select
  using (auth.uid() = reporter_id);
