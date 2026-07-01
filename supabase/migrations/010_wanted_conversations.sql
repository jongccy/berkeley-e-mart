-- Conversations for wanted posts (requests)

alter table public.conversations
  alter column listing_id drop not null;

alter table public.conversations
  add column if not exists wanted_post_id uuid references public.wanted_posts (id) on delete cascade;

alter table public.conversations
  drop constraint if exists conversations_listing_id_buyer_id_key;

alter table public.conversations
  drop constraint if exists conversations_context_check;

alter table public.conversations
  add constraint conversations_context_check check (
    (listing_id is not null and wanted_post_id is null)
    or (listing_id is null and wanted_post_id is not null)
  );

create unique index if not exists conversations_listing_buyer_idx
  on public.conversations (listing_id, buyer_id)
  where listing_id is not null;

create unique index if not exists conversations_wanted_buyer_idx
  on public.conversations (wanted_post_id, buyer_id)
  where wanted_post_id is not null;

create index if not exists conversations_wanted_idx
  on public.conversations (wanted_post_id);
