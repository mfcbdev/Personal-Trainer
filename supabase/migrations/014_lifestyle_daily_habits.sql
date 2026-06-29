-- Extends lifestyle_evaluation with the "Daily Habits" onboarding step
-- (steps, active hours, sleep quality, stress) introduced in Step 4.

alter table lifestyle_evaluation
  add column daily_steps integer,
  add column daily_active_hours numeric(4, 1),
  add column sleep_quality integer check (sleep_quality between 0 and 10),
  add column stress integer check (stress between 0 and 10);
