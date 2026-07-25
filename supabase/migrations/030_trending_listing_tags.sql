-- Tag filter performance + trending tags for browse / search filters

create index if not exists listings_tags_gin_idx
  on public.listings
  using gin (tags);

create or replace function public.get_trending_listing_tags(
  limit_count int default 12,
  lookback_days int default 45
)
returns table (tag text, use_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (
      array_agg(trim(t.tag) order by length(trim(t.tag)) desc)
    )[1] as tag,
    count(*)::bigint as use_count
  from public.listings l
  cross join lateral unnest(l.tags) as t(tag)
  where l.status = 'active'
    and cardinality(l.tags) > 0
    and nullif(trim(t.tag), '') is not null
    and l.created_at >= (now() - make_interval(days => greatest(1, least(lookback_days, 365))))
  group by lower(trim(t.tag))
  order by use_count desc, lower(trim(t.tag)) asc
  limit greatest(1, least(limit_count, 50));
$$;

revoke all on function public.get_trending_listing_tags(int, int) from public;
grant execute on function public.get_trending_listing_tags(int, int) to anon, authenticated;
