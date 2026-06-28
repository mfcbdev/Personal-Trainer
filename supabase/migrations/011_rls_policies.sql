-- Helper functions (security definer to avoid RLS recursion on lookups).

create or replace function current_trainer_id()
returns uuid
language sql security definer stable
set search_path = public
as $$
  select case when role = 'trainer' then id else trainer_id end
  from profiles
  where id = auth.uid();
$$;

create or replace function is_trainer_for_client(p_client_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = p_client_id and trainer_id = auth.uid()
  );
$$;

create or replace function can_access_program(p_program_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from programs
    where id = p_program_id and (client_id = auth.uid() or trainer_id = auth.uid())
  );
$$;

create or replace function can_access_session(p_session_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1
    from sessions s
    join weeks w on w.id = s.week_id
    join phases ph on ph.id = w.phase_id
    join programs pr on pr.id = ph.program_id
    where s.id = p_session_id and (pr.client_id = auth.uid() or pr.trainer_id = auth.uid())
  );
$$;

create or replace function can_access_session_exercise(p_session_exercise_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1
    from session_exercises se
    join sessions s on s.id = se.session_id
    join weeks w on w.id = s.week_id
    join phases ph on ph.id = w.phase_id
    join programs pr on pr.id = ph.program_id
    where se.id = p_session_exercise_id and (pr.client_id = auth.uid() or pr.trainer_id = auth.uid())
  );
$$;

create or replace function can_access_set_log(p_session_exercise_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select can_access_session_exercise(p_session_exercise_id);
$$;

create or replace function is_trainer_for_weekly_tracking(p_weekly_tracking_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1
    from weekly_tracking wt
    where wt.id = p_weekly_tracking_id
      and (wt.client_id = auth.uid() or is_trainer_for_client(wt.client_id))
  );
$$;

-- profiles --------------------------------------------------------------

alter table profiles enable row level security;

create policy profiles_select on profiles
  for select using (id = auth.uid() or trainer_id = auth.uid());

create policy profiles_insert on profiles
  for insert with check (id = auth.uid());

create policy profiles_update on profiles
  for update using (id = auth.uid() or trainer_id = auth.uid());

-- client_id-owned evaluation/measurement tables --------------------------

alter table health_evaluation enable row level security;
create policy health_evaluation_all on health_evaluation
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table lifestyle_evaluation enable row level security;
create policy lifestyle_evaluation_all on lifestyle_evaluation
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table cardiovascular_evaluation enable row level security;
create policy cardiovascular_evaluation_all on cardiovascular_evaluation
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table body_measurements enable row level security;
create policy body_measurements_all on body_measurements
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table hr_zones enable row level security;
create policy hr_zones_all on hr_zones
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table weekly_tracking enable row level security;
create policy weekly_tracking_all on weekly_tracking
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

alter table daily_log enable row level security;
create policy daily_log_all on daily_log
  for all using (is_trainer_for_weekly_tracking(weekly_tracking_id))
  with check (is_trainer_for_weekly_tracking(weekly_tracking_id));

-- exercises: trainer owns; client has read-only access to their trainer's library

alter table exercises enable row level security;

create policy exercises_select on exercises
  for select using (trainer_id = current_trainer_id());

create policy exercises_write on exercises
  for insert with check (trainer_id = auth.uid());

create policy exercises_update on exercises
  for update using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy exercises_delete on exercises
  for delete using (trainer_id = auth.uid());

-- programs: trainer manages, client reads their own

alter table programs enable row level security;

create policy programs_select on programs
  for select using (client_id = auth.uid() or trainer_id = auth.uid());

create policy programs_write on programs
  for insert with check (trainer_id = auth.uid());

create policy programs_update on programs
  for update using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy programs_delete on programs
  for delete using (trainer_id = auth.uid());

-- phases / weeks: follow the parent program

alter table phases enable row level security;
create policy phases_select on phases for select using (can_access_program(program_id));
create policy phases_write on phases for all using (can_access_program(program_id)) with check (can_access_program(program_id));

alter table weeks enable row level security;
create policy weeks_select on weeks for select using (
  exists (select 1 from phases where phases.id = weeks.phase_id and can_access_program(phases.program_id))
);
create policy weeks_write on weeks for all using (
  exists (select 1 from phases where phases.id = weeks.phase_id and can_access_program(phases.program_id))
) with check (
  exists (select 1 from phases where phases.id = weeks.phase_id and can_access_program(phases.program_id))
);

-- sessions: trainer full access, client read + completion updates

alter table sessions enable row level security;

create policy sessions_select on sessions
  for select using (can_access_session(id));

create policy sessions_insert on sessions
  for insert with check (can_access_session(id));

create policy sessions_update on sessions
  for update using (can_access_session(id)) with check (can_access_session(id));

create policy sessions_delete on sessions
  for delete using (can_access_session(id));

-- session_exercises: trainer manages structure, client reads + logs sets

alter table session_exercises enable row level security;
create policy session_exercises_all on session_exercises
  for all using (can_access_session(session_id)) with check (can_access_session(session_id));

-- set_logs: client logs their own sets during a workout, trainer can review

alter table set_logs enable row level security;
create policy set_logs_all on set_logs
  for all using (can_access_set_log(session_exercise_id)) with check (can_access_set_log(session_exercise_id));

-- progressions: trainer-managed planning table within a program

alter table progressions enable row level security;
create policy progressions_all on progressions
  for all using (can_access_program(program_id)) with check (can_access_program(program_id));

-- subscriptions: trainer manages their own billing record

alter table subscriptions enable row level security;
create policy subscriptions_all on subscriptions
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());
