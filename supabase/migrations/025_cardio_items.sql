-- Extends session_exercises to hold cardio items alongside strength ones.
-- Strength → existing shape (exercise_id + sets/reps/weight/rir_rpe/rest).
-- Cardio informal (caminata) → item_type='cardio_informal', total_minutes +
--   optional observations.
-- Cardio formal (cinta / elíptica / estática) → item_type='cardio_formal',
--   modality + rounds + work/rest/recovery seconds + incline + intensity +
--   observations.

create type session_item_type as enum ('strength', 'cardio_informal', 'cardio_formal');
create type cardio_modality as enum ('caminata', 'cinta', 'eliptica', 'estatica');

alter table session_exercises
  add column item_type session_item_type not null default 'strength',
  add column cardio_modality cardio_modality,
  add column total_minutes integer,
  add column rounds integer,
  add column work_seconds integer,
  add column rest_seconds integer,
  add column recovery_seconds integer,
  add column incline numeric(4, 1),
  add column intensity text,
  add column observations text;

-- exercise_id was NOT NULL. Cardio items don't reference the library, so
-- relax the constraint and add a check that keeps the two shapes consistent.
alter table session_exercises
  alter column exercise_id drop not null;

alter table session_exercises
  add constraint session_exercises_shape_check check (
    (item_type = 'strength' and exercise_id is not null)
    or (item_type in ('cardio_informal', 'cardio_formal') and exercise_id is null)
  );

-- Cardio items don't produce set_logs, so item-level completion lives here.
-- Strength items ignore this column (their completion is derived from
-- set_logs.completed).
alter table session_exercises
  add column completed boolean not null default false;
