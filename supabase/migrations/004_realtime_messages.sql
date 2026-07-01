-- Required for filtered Realtime subscriptions on messages
-- (ChatThread filters by conversation_id)

alter table public.messages replica identity full;
