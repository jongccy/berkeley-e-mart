-- Verified Berkeley student badge (shown next to display names in the app)

alter table public.profiles
  add column if not exists is_verified_berkeley boolean not null default false;

create or replace function public.sync_profile_verified_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  verified boolean;
begin
  verified := public.is_berkeley_email(new.email)
    and (
      new.email_confirmed_at is not null
      or exists (
        select 1
        from auth.identities i
        where i.user_id = new.id
          and i.provider = 'google'
      )
    );

  update public.profiles
  set is_verified_berkeley = verified
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_sync_verified_badge on auth.users;
create trigger on_auth_user_sync_verified_badge
  after insert or update of email, email_confirmed_at on auth.users
  for each row
  execute function public.sync_profile_verified_badge();

update public.profiles p
set is_verified_berkeley = true
from auth.users u
where u.id = p.id
  and public.is_berkeley_email(u.email)
  and (
    u.email_confirmed_at is not null
    or exists (
      select 1
      from auth.identities i
      where i.user_id = u.id
        and i.provider = 'google'
    )
  );
