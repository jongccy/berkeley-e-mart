-- Block users: no messaging between blocked parties; hide each other's listings from browse

create table public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

create index user_blocks_blocker_idx on public.user_blocks (blocker_id, created_at desc);
create index user_blocks_blocked_idx on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

create policy "Users can view own blocks"
  on public.user_blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can block others"
  on public.user_blocks for insert
  with check (
    auth.uid() = blocker_id
    and public.is_authenticated_berkeley()
    and blocker_id <> blocked_id
  );

create policy "Users can unblock others"
  on public.user_blocks for delete
  using (auth.uid() = blocker_id);

create or replace function public.users_are_blocked(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks ub
    where (ub.blocker_id = user_a and ub.blocked_id = user_b)
       or (ub.blocker_id = user_b and ub.blocked_id = user_a)
  );
$$;

revoke all on function public.users_are_blocked(uuid, uuid) from public;
grant execute on function public.users_are_blocked(uuid, uuid) to authenticated;
grant execute on function public.users_are_blocked(uuid, uuid) to anon;

create or replace function public.get_my_block_related_user_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(distinct related_user_id),
    '{}'::uuid[]
  )
  from (
    select blocked_id as related_user_id
    from public.user_blocks
    where blocker_id = auth.uid()
    union
    select blocker_id as related_user_id
    from public.user_blocks
    where blocked_id = auth.uid()
  ) related_users;
$$;

revoke all on function public.get_my_block_related_user_ids() from public;
grant execute on function public.get_my_block_related_user_ids() to authenticated;

-- Hide blocked sellers' listings (bidirectional) for signed-in viewers
drop policy if exists "Hide blocked users listings" on public.listings;
create policy "Hide blocked users listings"
  on public.listings as restrictive
  for select
  using (
    auth.uid() is null
    or seller_id = auth.uid()
    or not public.users_are_blocked(auth.uid(), seller_id)
  );

drop policy if exists "Verified users can start conversations" on public.conversations;
create policy "Verified users can start conversations"
  on public.conversations for insert
  with check (
    public.is_verified_berkeley()
    and auth.uid() = buyer_id
    and buyer_id <> seller_id
    and not public.users_are_blocked(auth.uid(), seller_id)
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    public.is_verified_berkeley()
    and auth.uid() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
        and not public.users_are_blocked(c.buyer_id, c.seller_id)
    )
  );
