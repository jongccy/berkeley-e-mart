-- Per-listing seller display: profile name, nickname, or anonymous

alter table public.listings
  add column seller_display_mode text not null default 'profile'
    check (seller_display_mode in ('profile', 'nickname', 'anonymous')),
  add column seller_display_name text;
