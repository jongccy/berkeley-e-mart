-- Storage policies for listing-images bucket
-- Create bucket in Supabase: public, name listing-images

create policy "Public read listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Verified users can upload listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and public.is_verified_berkeley()
  );

create policy "Users can update own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket: create public bucket named "avatars" in Supabase dashboard

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Verified users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and public.is_verified_berkeley()
  );

create policy "Users can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Phase 2: wanted posts, listing views, recommendations

create type wanted_type as enum ('item', 'service', 'lease');

create table public.wanted_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type wanted_type not null,
  title text not null,
  description text not null,
  category text not null default 'general',
  max_price_cents integer,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wanted_posts_status_created_idx on public.wanted_posts (status, created_at desc);

create table public.listing_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index listing_views_user_viewed_idx on public.listing_views (user_id, viewed_at desc);

alter table public.wanted_posts enable row level security;
alter table public.listing_views enable row level security;

create policy "Wanted posts are public when open"
  on public.wanted_posts for select
  using (status = 'open' or user_id = auth.uid());

create policy "Verified users can create wanted posts"
  on public.wanted_posts for insert
  with check (auth.uid() = user_id and public.is_verified_berkeley());

create policy "Users can update own wanted posts"
  on public.wanted_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own wanted posts"
  on public.wanted_posts for delete
  using (auth.uid() = user_id);

create policy "Users can view own listing views"
  on public.listing_views for select
  using (auth.uid() = user_id);

create policy "Verified users can log listing views"
  on public.listing_views for insert
  with check (auth.uid() = user_id and public.is_verified_berkeley());

create policy "Users can update own listing views"
  on public.listing_views for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger wanted_posts_updated_at
  before update on public.wanted_posts
  for each row execute function public.set_updated_at();

-- Realtime for messages
alter publication supabase_realtime add table public.messages;
