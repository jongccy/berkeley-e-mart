-- Listing quality rating (1-5 stars); seller display + remove anonymous mode
-- Safe if migration 005 was never run (adds seller columns first).

alter table public.listings
  add column if not exists seller_display_mode text not null default 'profile',
  add column if not exists seller_display_name text;

alter table public.listings
  add column if not exists quality_rating smallint
    check (quality_rating >= 1 and quality_rating <= 5);

update public.listings
set
  seller_display_mode = 'nickname',
  seller_display_name = coalesce(nullif(trim(seller_display_name), ''), 'Seller')
where seller_display_mode = 'anonymous';

alter table public.listings drop constraint if exists listings_seller_display_mode_check;

alter table public.listings
  add constraint listings_seller_display_mode_check
  check (seller_display_mode in ('profile', 'nickname'));
