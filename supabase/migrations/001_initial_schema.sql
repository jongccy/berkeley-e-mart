-- Berkeley E-Mart: core schema + RLS

create extension if not exists "pgcrypto";

create type listing_type as enum ('item', 'service', 'lease');
create type listing_status as enum ('active', 'sold', 'removed');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  type listing_type not null,
  title text not null,
  description text not null,
  price_cents integer,
  category text not null default 'general',
  status listing_status not null default 'active',
  address_area text,
  bedrooms smallint,
  bathrooms numeric(3, 1),
  lease_start date,
  lease_end date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_type_idx on public.listings (type);
create index listings_category_idx on public.listings (category);
create index listings_seller_idx on public.listings (seller_id);

-- Listing images
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_idx on public.listing_images (listing_id, sort_order);

-- Conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);
create index conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- Helpers
create or replace function public.is_berkeley_email(email text)
returns boolean
language sql
immutable
as $$
  select lower(email) like '%@berkeley.edu';
$$;

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
      and u.email_confirmed_at is not null
  );
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_berkeley_email(new.email) then
    raise exception 'Only @berkeley.edu emails are allowed';
  end if;

  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'Berkeley Student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update conversation last_message_at
create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Listings policies
create policy "Active listings are public"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Verified Berkeley users can create listings"
  on public.listings for insert
  with check (
    auth.uid() = seller_id
    and public.is_verified_berkeley()
  );

create policy "Sellers can update own listings"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Sellers can delete own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- Listing images policies
create policy "Listing images follow listing visibility"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

create policy "Sellers can manage listing images"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    public.is_verified_berkeley()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

-- Conversations policies
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Verified users can start conversations"
  on public.conversations for insert
  with check (
    public.is_verified_berkeley()
    and auth.uid() = buyer_id
    and buyer_id <> seller_id
  );

-- Messages policies
create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    public.is_verified_berkeley()
    and auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Storage bucket (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
