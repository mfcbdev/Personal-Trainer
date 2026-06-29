import { Copy, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { WEEKDAY_LABELS, getDateForWeekday, formatShortDate, toISODate } from '../../lib/scheduling';
import type { SessionWithCount } from '../../hooks/useProgramBuilder';

interface SessionCardProps {
  session: SessionWithCount;
  weekStart: Date;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetDay: (isoDate: string) => void;
}

export function SessionCard({ session, weekStart, onClick, onDuplicate, onDelete, onSetDay }: SessionCardProps) {
  const selectedDayIndex = WEEKDAY_LABELS.findIndex(
    (_, i) => session.scheduled_date === toISODate(getDateForWeekday(weekStart, i)),
  );

  return (
    <div className="w-40 shrink-0 rounded-lg bg-surface p-3 flex flex-col gap-2">
      <button type="button" onClick={onClick} className="text-left flex-1">
        <p className="text-sm font-medium text-zinc-50">Sesión {session.session_number}</p>
        <p className="text-xs text-zinc-500 mt-1">{session.exerciseCount} ejercicios</p>
        {session.scheduled_date && (
          <p className="text-xs text-accent mt-1 capitalize">
            {formatShortDate(getDateForWeekday(weekStart, selectedDayIndex >= 0 ? selectedDayIndex : 0))}
          </p>
        )}
      </button>

      <div className="flex gap-0.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => onSetDay(toISODate(getDateForWeekday(weekStart, i)))}
            className={cn(
              'flex-1 h-6 rounded text-[10px] font-medium',
              selectedDayIndex === i ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-500',
            )}
          >
            {label[0]}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Duplicar sesión"
          onClick={onDuplicate}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-50"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          aria-label="Eliminar sesión"
          onClick={onDelete}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
