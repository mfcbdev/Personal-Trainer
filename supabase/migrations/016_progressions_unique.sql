-- Supports upsert-per-cell in the progression table editor.
alter table progressions
  add constraint progressions_phase_muscle_week_key unique (phase_id, muscle_group, week_number);
