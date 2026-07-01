-- Track when a user accepted Terms of Service and Privacy Policy

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;
