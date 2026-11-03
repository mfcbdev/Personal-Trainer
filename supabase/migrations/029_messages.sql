-- Comunicación (Notion 10.6): one message thread per alumno, shared with
-- their trainer. Safe to re-run.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_client_id_created_at_idx on messages (client_id, created_at);

alter table messages enable row level security;

drop policy if exists messages_select on messages;
drop policy if exists messages_insert on messages;
drop policy if exists messages_update on messages;

-- The alumno and their trainer can read the thread.
create policy messages_select on messages
  for select using (client_id = auth.uid() or is_trainer_for_client(client_id));

-- Post only as yourself, only into a thread you belong to.
create policy messages_insert on messages
  for insert with check (
    sender_id = auth.uid()
    and (client_id = auth.uid() or is_trainer_for_client(client_id))
  );

-- Only the recipient may touch a message, and the grant below limits that
-- to read_at — nobody can rewrite a message body after sending.
create policy messages_update on messages
  for update using (
    sender_id <> auth.uid()
    and (client_id = auth.uid() or is_trainer_for_client(client_id))
  );

revoke update on messages from anon, authenticated;
grant update (read_at) on messages to authenticated;

-- Live updates for the open thread.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;
