-- Track per-user read state for inbox unread indicators

create table public.conversation_reads (
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, conversation_id)
);

create index conversation_reads_user_idx
  on public.conversation_reads (user_id);

alter table public.conversation_reads enable row level security;

create policy "Users can view own conversation reads"
  on public.conversation_reads for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversation reads"
  on public.conversation_reads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversation reads"
  on public.conversation_reads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.get_unread_inbox_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.conversations c
  where (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    and exists (
      select 1
      from public.messages m
      where m.conversation_id = c.id
        and m.sender_id <> auth.uid()
        and m.created_at > coalesce(
          (
            select cr.last_read_at
            from public.conversation_reads cr
            where cr.conversation_id = c.id
              and cr.user_id = auth.uid()
          ),
          timestamptz 'epoch'
        )
    );
$$;

grant execute on function public.get_unread_inbox_count() to authenticated;
