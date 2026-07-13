-- Global catalog of exercises seeded from an external dataset
-- (hasaneyldrm/exercises-dataset, 1,324 records). All trainers see the
-- same rows and can "import" any into their own exercises table via
-- the import_catalog_exercise RPC. The existing exercises table
-- (per-trainer, 218 seeded via seed_default_exercises()) is untouched.

create table exercises_catalog (
  id text primary key,                    -- "0001", "0002" from the dataset
  name text not null,                     -- English name
  name_es text,                           -- Spanish name (hand-translated later; NULL from a fresh import)
  category text not null,                 -- body part: chest, back, waist, cardio, ...
  equipment text not null,                -- body weight, dumbbell, barbell, cable, ...
  target text not null,                   -- primary target muscle: pectorals, biceps, ...
  muscle_group text not null,             -- primary synergist muscle group
  secondary_muscles text[] not null default '{}',
  instructions_en text,
  instructions_es text,
  zone exercise_zone not null,            -- derived from category
  movement_type movement_type not null,   -- derived from category + target
  image_url text,                         -- Supabase Storage public URL
  gif_url text,                           -- Supabase Storage public URL
  created_at timestamptz not null default now()
);

create index exercises_catalog_category_idx on exercises_catalog (category);
create index exercises_catalog_target_idx on exercises_catalog (target);
create index exercises_catalog_equipment_idx on exercises_catalog (equipment);
create index exercises_catalog_zone_idx on exercises_catalog (zone);

alter table exercises_catalog enable row level security;

-- Everyone signed in can browse the catalog; nobody writes to it via the API
-- (seed script uses the service role which bypasses RLS).
create policy exercises_catalog_select on exercises_catalog
  for select
  to authenticated
  using (true);

-- Import a catalog exercise into the caller's own exercises table.
-- SECURITY DEFINER so it can bypass RLS on the insert, but we derive
-- the trainer_id from auth.uid() and require the caller to be a
-- trainer — a client-supplied trainer_id would be a footgun (anyone
-- could pollute another trainer's library).
create or replace function import_catalog_exercise(p_catalog_id text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_exercise_id uuid;
  v_catalog exercises_catalog%rowtype;
  v_role user_role;
begin
  select role into v_role from profiles where id = auth.uid();
  if v_role is null then
    raise exception 'Not authenticated';
  end if;
  if v_role <> 'trainer' then
    raise exception 'Only trainers can import catalog exercises';
  end if;

  select * into v_catalog from exercises_catalog where id = p_catalog_id;
  if not found then
    raise exception 'Catalog exercise not found: %', p_catalog_id;
  end if;

  insert into exercises (
    trainer_id, name, muscle_group, zone, movement_type,
    image_url, gif_url, notes
  ) values (
    auth.uid(),
    coalesce(v_catalog.name_es, v_catalog.name),
    v_catalog.target,
    v_catalog.zone,
    v_catalog.movement_type,
    v_catalog.image_url,
    v_catalog.gif_url,
    v_catalog.instructions_es
  )
  returning id into v_exercise_id;

  return v_exercise_id;
end;
$$;
