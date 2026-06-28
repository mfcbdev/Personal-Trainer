-- on_auth_user_created: insert a profile row when a new auth user signs up.
-- Expects role / trainer_id / full_name to be passed as auth user metadata,
-- e.g. supabase.auth.signUp({ email, password, options: { data: {
--   role: 'trainer' | 'client', trainer_id?: uuid, full_name: string } } })

create or replace function handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, trainer_id, role, full_name, email)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'trainer_id')::uuid,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client'),
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- on_program_created: auto-insert the 4 fixed GROW phases plus 4 weeks each.

create or replace function handle_new_program()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  phase_row record;
  new_phase_id uuid;
  week_number integer;
begin
  for phase_row in
    select * from (values ('G', 1), ('R', 2), ('O', 3), ('W', 4)) as t(type, order_idx)
  loop
    insert into phases (program_id, type, "order")
    values (new.id, phase_row.type::phase_type, phase_row.order_idx)
    returning id into new_phase_id;

    for week_number in 1..4 loop
      insert into weeks (phase_id, week_number, is_deload)
      values (new_phase_id, week_number, false);
    end loop;
  end loop;

  return new;
end;
$$;

create trigger on_program_created
  after insert on programs
  for each row execute function handle_new_program();
