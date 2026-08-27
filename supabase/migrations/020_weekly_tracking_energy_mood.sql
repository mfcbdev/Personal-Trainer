-- Adds energía (energy) and estado de ánimo (mood) sliders to the weekly
-- tracking form. Both are 1-10 to match the other sliders on the page.

alter table weekly_tracking
  add column energy integer check (energy between 1 and 10),
  add column mood integer check (mood between 1 and 10);
