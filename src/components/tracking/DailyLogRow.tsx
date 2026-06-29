import { Controller, type Control } from 'react-hook-form';
import { cn } from '../../utils/cn';
import { WEEKDAY_LABELS } from '../../lib/scheduling';
import type { WeeklyTrackingFormInput } from '../../lib/weekly-tracking-schema';

const STATUS_OPTIONS: { value: 'achieved' | 'in_progress' | 'missed'; label: string }[] = [
  { value: 'achieved', label: 'Logrado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'missed', label: 'No logrado' },
];

interface DailyLogRowProps {
  index: number;
  control: Control<WeeklyTrackingFormInput>;
}

export function DailyLogRow({ index, control }: DailyLogRowProps) {
  return (
    <div className="py-3 border-b border-zinc-800 last:border-0">
      <p className="text-sm font-medium text-zinc-200 mb-2">{WEEKDAY_LABELS[index]}</p>
      <Controller
        control={control}
        name={`dailyLogs.${index}.status`}
        render={({ field }) => (
          <div className="flex gap-1.5 mb-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => field.onChange(opt.value)}
                className={cn(
                  'h-8 px-3 rounded-full text-xs font-medium',
                  field.value === opt.value ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      />
      <Controller
        control={control}
        name={`dailyLogs.${index}.observation`}
        render={({ field }) => (
          <input
            {...field}
            type="text"
            placeholder="Observación (opcional)"
            className="h-9 w-full rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
          />
        )}
      />
    </div>
  );
}
