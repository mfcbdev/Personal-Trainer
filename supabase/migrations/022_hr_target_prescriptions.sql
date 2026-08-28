-- Extends cardiovascular_evaluation with the coach's per-target prescription
-- for velocidad (km/h) and inclinación (%) at 90 / 80 / 70 / 60 % of max HR.
-- LPM stays computed from resting_hr + max_hr via Karvonen and is not stored.

alter table cardiovascular_evaluation
  add column target_90_kmh numeric(4, 1),
  add column target_90_incline numeric(4, 1),
  add column target_80_kmh numeric(4, 1),
  add column target_80_incline numeric(4, 1),
  add column target_70_kmh numeric(4, 1),
  add column target_70_incline numeric(4, 1),
  add column target_60_kmh numeric(4, 1),
  add column target_60_incline numeric(4, 1);
