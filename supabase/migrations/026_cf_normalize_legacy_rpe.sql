-- CF (Cercanía al Fallo) uses integer 1–10 in the UI, but historical
-- set_logs.rpe rows written before the CF rebrand still hold 0.5-step
-- values (6.5, 7.5, 8.5, 9.5). Those values match no CF_OPTIONS entry,
-- so the alumno's <select> renders empty and any interaction overwrites
-- them. Normalise to nearest integer and clamp to the CF range.

update set_logs
set rpe = greatest(1, least(10, round(rpe)::numeric))
where rpe is not null
  and (rpe <> round(rpe) or rpe < 1 or rpe > 10);

-- Add a check constraint so future writes can't reintroduce out-of-range
-- values. Existing rows are already normalised by the update above.
alter table set_logs
  add constraint set_logs_cf_range_check
    check (rpe is null or (rpe between 1 and 10 and rpe = round(rpe)));
