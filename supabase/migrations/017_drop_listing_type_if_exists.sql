-- Catch-up: remove legacy type column (safe if migration 007 was never applied)

update public.listings set category = case category
  when 'books' then 'textbooks'
  when 'bikes' then 'transportation'
  when 'general' then 'other'
  when 'dorm' then 'other'
  when 'moving' then 'other'
  when 'cleaning' then 'other'
  when 'tutoring' then 'other'
  else category end;

update public.wanted_posts set category = case category
  when 'books' then 'textbooks'
  when 'bikes' then 'transportation'
  when 'general' then 'other'
  when 'dorm' then 'other'
  when 'moving' then 'other'
  when 'cleaning' then 'other'
  when 'tutoring' then 'other'
  else category end;

alter table public.listings drop column if exists type;
alter table public.wanted_posts drop column if exists type;

drop type if exists listing_type;
drop type if exists wanted_type;

alter table public.listings alter column category set default 'other';
alter table public.wanted_posts alter column category set default 'other';
