-- Housing / leasing listing fields: sqft and included utilities

alter table public.listings
  add column if not exists sqft integer,
  add column if not exists included_utilities text;
