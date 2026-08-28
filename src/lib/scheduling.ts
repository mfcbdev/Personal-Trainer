import { addDays, format, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WEEKS_PER_PHASE = 4;

/**
 * Parse a bare `YYYY-MM-DD` string (Supabase `date` columns, `<input type="date">` values)
 * as a local-time Date. `parseISO` treats it as UTC midnight, which shifts to the previous
 * day for any west-of-UTC timezone once formatted back with `format`.
 */
export function parseLocalDate(iso: string): Date {
  return parse(iso, 'yyyy-MM-dd', new Date());
}

/** Monday of the given phase/week, assuming the program's start_date is week 1's Monday. */
export function getWeekStartDate(programStartDate: string, phaseOrder: number, weekNumber: number): Date {
  const absoluteWeekIndex = (phaseOrder - 1) * WEEKS_PER_PHASE + (weekNumber - 1);
  return addDays(parseLocalDate(programStartDate), absoluteWeekIndex * 7);
}

export function getDateForWeekday(weekStart: Date, dayIndex: number): Date {
  return addDays(weekStart, dayIndex);
}

export function formatShortDate(date: Date): string {
  return format(date, "EEE d 'de' MMM", { locale: es });
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getCurrentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

export function getMondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Phase index (0..3) the program is currently in, computed from its start date.
 * Each phase is 4 weeks. Values before the program starts clamp to 0; values
 * after the last week clamp to 3. Returns 0 (G) as the safe default for empty
 * inputs so callers can still render the first phase.
 */
export function getCurrentPhaseIndex(programStartDate: string | null | undefined): number {
  if (!programStartDate) return 0;
  const start = parseLocalDate(programStartDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return 0;
  const weekIndex = Math.floor(daysSinceStart / 7);
  const phaseIndex = Math.floor(weekIndex / WEEKS_PER_PHASE);
  return Math.min(Math.max(phaseIndex, 0), 3);
}

export function parseRestSeconds(rest: string | null): number {
  if (!rest) return 60;
  const match = rest.match(/(\d+)/);
  return match ? Number(match[1]) : 60;
}

export function estimateSessionMinutes(items: { sets: number | null; rest: string | null }[]): number {
  const totalSeconds = items.reduce((sum, item) => {
    const sets = item.sets ?? 3;
    return sum + sets * (45 + parseRestSeconds(item.rest));
  }, 0);
  return Math.round(totalSeconds / 60);
}
