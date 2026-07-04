-- Let sellers read aggregate view counts for their own listings (not viewer identities)

create or replace function public.get_my_listing_view_counts(listing_ids uuid[])
returns table (listing_id uuid, view_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select lv.listing_id, count(*)::bigint as view_count
  from public.listing_views lv
  inner join public.listings l on l.id = lv.listing_id
  where l.seller_id = auth.uid()
    and lv.listing_id = any(listing_ids)
  group by lv.listing_id;
$$;

revoke all on function public.get_my_listing_view_counts(uuid[]) from public;
grant execute on function public.get_my_listing_view_counts(uuid[]) to authenticated;
