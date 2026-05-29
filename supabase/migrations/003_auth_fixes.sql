-- Run in Supabase SQL Editor after 001 and 002
-- Supports @berkeley.edu and subdomains like @haas.berkeley.edu

create or replace function public.is_berkeley_email(email text)
returns boolean
language sql
immutable
as $$
  select lower(trim(email)) ~ '^[^@]+@([a-z0-9-]+\.)*berkeley\.edu$';
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_berkeley_email(new.email) then
    raise exception 'Only Berkeley (@berkeley.edu) emails are allowed';
  end if;

  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(split_part(new.email, '@', 1)), ''),
      'Berkeley Student'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Allow OAuth callback to ensure profile row exists
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
