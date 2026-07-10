-- Ensure messages stream to Realtime (required for live chat + toast notifications)

alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
