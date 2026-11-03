-- CF (Cercanía al Fallo) uses integer 1–10 in the UI, but historical
-- set_logs.rpe rows written before the CF rebrand still hold 0.5-step
-- values (6.5, 7.5, 8.5, 9.5). Those values match no CF_OPTIONS entry,
-- so the alumno's <select> renders empty and any interaction overwrites
-- them. Normalise to nearest integer and clamp to the CF range.
-- Safe to re-run: the UPDATE only touches non-conforming rows and the
-- constraint is dropped before being re-added.

update set_logs
set rpe = greatest(1, least(10, round(rpe)::numeric))
where rpe is not null
  and (rpe <> round(rpe) or rpe < 1 or rpe > 10);

alter table set_logs drop constraint if exists set_logs_cf_range_check;
alter table set_logs
  add constraint set_logs_cf_range_check
    check (rpe is null or (rpe between 1 and 10 and rpe = round(rpe)));
