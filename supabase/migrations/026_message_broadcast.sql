-- Deliver new messages via Realtime Broadcast (bypasses flaky postgres_changes + RLS filtering).
-- Each recipient listens on private topic: inbox:{user_id}

alter table realtime.messages enable row level security;

drop policy if exists "Users can receive own inbox broadcasts" on realtime.messages;
create policy "Users can receive own inbox broadcasts"
  on realtime.messages
  for select
  to authenticated
  using (
    extension = 'broadcast'
    and realtime.topic() = ('inbox:' || (select auth.uid()::text))
  );

create or replace function public.broadcast_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_id uuid;
  seller_id uuid;
  recipient_id uuid;
  payload jsonb;
begin
  select c.buyer_id, c.seller_id
    into buyer_id, seller_id
  from public.conversations c
  where c.id = new.conversation_id;

  if buyer_id is null or seller_id is null then
    return new;
  end if;

  if new.sender_id = buyer_id then
    recipient_id := seller_id;
  elsif new.sender_id = seller_id then
    recipient_id := buyer_id;
  else
    return new;
  end if;

  payload := jsonb_build_object(
    'id', new.id,
    'conversation_id', new.conversation_id,
    'sender_id', new.sender_id,
    'body', new.body,
    'created_at', new.created_at
  );

  perform realtime.send(
    payload,
    'new_message',
    'inbox:' || recipient_id::text,
    true
  );

  return new;
end;
$$;

drop trigger if exists messages_broadcast_new_message on public.messages;
create trigger messages_broadcast_new_message
  after insert on public.messages
  for each row
  execute function public.broadcast_new_message();
