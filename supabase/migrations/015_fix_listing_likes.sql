-- Fix saved listings for Google OAuth users and liked-listing image visibility

create or replace function public.is_authenticated_berkeley()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and public.is_berkeley_email(u.email)
  );
$$;

create table if not exists public.listing_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists listing_likes_user_idx
  on public.listing_likes (user_id, created_at desc);

alter table public.listing_likes enable row level security;

drop policy if exists "Users can view own likes" on public.listing_likes;
create policy "Users can view own likes"
  on public.listing_likes for select
  using (auth.uid() = user_id);

drop policy if exists "Verified users can like listings" on public.listing_likes;
drop policy if exists "Authenticated Berkeley users can like listings" on public.listing_likes;
create policy "Authenticated Berkeley users can like listings"
  on public.listing_likes for insert
  with check (
    auth.uid() = user_id
    and public.is_authenticated_berkeley()
  );

drop policy if exists "Users can unlike own listings" on public.listing_likes;
create policy "Users can unlike own listings"
  on public.listing_likes for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view liked listings" on public.listings;
create policy "Users can view liked listings"
  on public.listings for select
  using (
    exists (
      select 1
      from public.listing_likes ll
      where ll.listing_id = listings.id
        and ll.user_id = auth.uid()
    )
  );

drop policy if exists "Listing images follow listing visibility" on public.listing_images;
create policy "Listing images follow listing visibility"
  on public.listing_images for select
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and (
          l.status = 'active'
          or l.seller_id = auth.uid()
          or (
            l.status = 'sold'
            and l.sold_at is not null
            and l.sold_at > (now() - interval '24 hours')
          )
          or exists (
            select 1
            from public.listing_likes ll
            where ll.listing_id = l.id
              and ll.user_id = auth.uid()
          )
        )
    )
  );
