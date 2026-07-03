-- Treat Google OAuth Berkeley users as verified for listings, storage, and messaging

create or replace function public.is_verified_berkeley()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and public.is_berkeley_email(u.email)
      and (
        u.email_confirmed_at is not null
        or exists (
          select 1
          from auth.identities i
          where i.user_id = u.id
            and i.provider = 'google'
        )
      )
  );
$$;
