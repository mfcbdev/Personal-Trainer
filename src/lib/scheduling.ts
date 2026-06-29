import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WEEKS_PER_PHASE = 4;

/** Monday of the given phase/week, assuming the program's start_date is week 1's Monday. */
export function getWeekStartDate(programStartDate: string, phaseOrder: number, weekNumber: number): Date {
  const absoluteWeekIndex = (phaseOrder - 1) * WEEKS_PER_PHASE + (weekNumber - 1);
  return addDays(parseISO(programStartDate), absoluteWeekIndex * 7);
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
