-- Listing tags (preset + custom)

alter table public.listings
  add column if not exists tags text[] not null default '{}';
