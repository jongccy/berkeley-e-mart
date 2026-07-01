-- Allow listing images for recently sold listings (matches listings RLS)

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
        )
    )
  );
