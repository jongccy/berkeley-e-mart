-- Private listing likes (saved listings)

create table public.listing_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index listing_likes_user_idx
  on public.listing_likes (user_id, created_at desc);

alter table public.listing_likes enable row level security;

create policy "Users can view own likes"
  on public.listing_likes for select
  using (auth.uid() = user_id);

create policy "Verified users can like listings"
  on public.listing_likes for insert
  with check (
    auth.uid() = user_id
    and public.is_verified_berkeley()
  );

create policy "Users can unlike own listings"
  on public.listing_likes for delete
  using (auth.uid() = user_id);

-- Let users view listings they have saved (even if sold)
create policy "Users can view liked listings"
  on public.listings for select
  using (
    status in ('active', 'sold')
    and exists (
      select 1
      from public.listing_likes ll
      where ll.listing_id = listings.id
        and ll.user_id = auth.uid()
    )
  );
