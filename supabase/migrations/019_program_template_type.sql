-- Adds a lightweight "template" tag to programs so the coach can classify a
-- program by the kind of training block it is (fuerza, hipertrofia, HIIT,
-- movilidad, general). The tag is metadata only — nothing about program
-- structure changes based on it.

create type program_template_type as enum ('strength', 'hypertrophy', 'hiit', 'mobility', 'general');

alter table programs
  add column template_type program_template_type;
