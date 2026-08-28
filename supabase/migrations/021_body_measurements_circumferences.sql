-- Adds circumference measurements to body_measurements — the monthly numbers
-- Harold takes for the alumno's evaluación mensual (cintura, cadera, muslo,
-- bíceps). Values are stored in centimeters. Skin folds stay as separate
-- columns; these are additive.

alter table body_measurements
  add column waist numeric(5, 2),
  add column hip numeric(5, 2),
  add column thigh numeric(5, 2),
  add column biceps_circumference numeric(5, 2);
