-- sessions_insert previously checked can_access_session(id), which looks up
-- the sessions table by its own id. On INSERT the new row isn't visible to
-- that self-referencing subquery yet, so the check always failed with 403.
-- Fix: derive access from week_id (a column already present on insert)
-- instead of looking the row up by its own not-yet-committed id.

create or replace function can_access_week(p_week_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1
    from weeks w
    join phases ph on ph.id = w.phase_id
    join programs pr on pr.id = ph.program_id
    where w.id = p_week_id and (pr.client_id = auth.uid() or pr.trainer_id = auth.uid())
  );
$$;

drop policy if exists sessions_insert on sessions;
create policy sessions_insert on sessions
  for insert with check (can_access_week(week_id));
