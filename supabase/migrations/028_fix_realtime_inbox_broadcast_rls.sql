-- Fix private inbox broadcast authorization (used as an optional path).
-- Toasts currently rely on postgres_changes; this keeps Broadcast workable too.

alter table realtime.messages enable row level security;

drop policy if exists "Users can receive own inbox broadcasts" on realtime.messages;
create policy "Users can receive own inbox broadcasts"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and (select realtime.topic()) = ('inbox:' || (select auth.uid()::text))
  );
