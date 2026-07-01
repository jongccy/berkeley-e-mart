-- Profile-level marketplace identity: real name vs fixed alias

alter table public.profiles
  add column if not exists show_real_name boolean not null default true,
  add column if not exists marketplace_alias text;
