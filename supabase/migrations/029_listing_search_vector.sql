-- Full-text search vector for listings (title, description, tags)
-- Generated columns require IMMUTABLE expressions; wrap array_to_string
-- and pin the text-search config as regconfig.

create or replace function public.immutable_array_to_string(arr text[], sep text)
returns text
language sql
immutable
parallel safe
as $$
  select array_to_string(arr, sep);
$$;

alter table public.listings
  drop column if exists search_vector;

alter table public.listings
  add column search_vector tsvector
  generated always as (
    setweight(
      to_tsvector('english'::regconfig, coalesce(title, '')),
      'A'
    )
    || setweight(
      to_tsvector('english'::regconfig, coalesce(description, '')),
      'B'
    )
    || setweight(
      to_tsvector(
        'english'::regconfig,
        coalesce(public.immutable_array_to_string(tags, ' '), '')
      ),
      'C'
    )
  ) stored;

create index if not exists listings_search_vector_idx
  on public.listings
  using gin (search_vector);
