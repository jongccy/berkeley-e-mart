-- Track when a listing was marked sold (24h public visibility window)

alter table public.listings
  add column if not exists sold_at timestamptz;

update public.listings
set sold_at = updated_at
where status = 'sold'
  and sold_at is null;

alter policy "Active listings are public"
  on public.listings
  using (
    status = 'active'
    or seller_id = auth.uid()
    or (
      status = 'sold'
      and sold_at is not null
      and sold_at > (now() - interval '24 hours')
    )
  );
