-- Backfill $0 listings into the Free / Giveaway category

update public.listings
set category = 'free'
where price_cents = 0
  and category is distinct from 'free';
