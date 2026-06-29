import { cn } from '../../utils/cn';
import { WEEKDAY_LABELS, getDateForWeekday, toISODate } from '../../lib/scheduling';
import type { FlatSession } from '../../lib/program-utils';

interface AdherenceBarProps {
  weekStart: Date;
  sessions: FlatSession[];
}

export function AdherenceBar({ weekStart, sessions }: AdherenceBarProps) {
  return (
    <div className="flex justify-between">
      {WEEKDAY_LABELS.map((label, i) => {
        const iso = toISODate(getDateForWeekday(weekStart, i));
        const match = sessions.find((s) => s.session.scheduled_date === iso);
        return (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-zinc-500">{label[0]}</span>
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                match?.session.completed
                  ? 'bg-accent'
                  : match
                    ? 'border border-zinc-500'
                    : 'bg-zinc-800',
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
