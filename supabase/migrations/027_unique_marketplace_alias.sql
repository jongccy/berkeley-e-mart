-- Enforce unique marketplace IDs (case-insensitive). Null/blank aliases stay allowed.

-- Resolve any existing duplicates so the unique index can be created.
-- Keep the earliest profile's alias; clear later duplicates.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(marketplace_alias))
      order by created_at asc nulls last, id asc
    ) as rn
  from public.profiles
  where marketplace_alias is not null
    and trim(marketplace_alias) <> ''
)
update public.profiles p
set marketplace_alias = null
from ranked r
where p.id = r.id
  and r.rn > 1;

create unique index if not exists profiles_marketplace_alias_unique_ci
  on public.profiles (lower(trim(marketplace_alias)))
  where marketplace_alias is not null
    and trim(marketplace_alias) <> '';

create or replace function public.is_marketplace_alias_taken(
  alias text,
  exclude_user_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.marketplace_alias is not null
      and trim(p.marketplace_alias) <> ''
      and lower(trim(p.marketplace_alias)) = lower(trim(alias))
      and (exclude_user_id is null or p.id <> exclude_user_id)
  );
$$;

revoke all on function public.is_marketplace_alias_taken(text, uuid) from public;
grant execute on function public.is_marketplace_alias_taken(text, uuid) to authenticated;
