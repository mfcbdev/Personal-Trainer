import { Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { GhostValue, SetUpdateFields } from '../../hooks/useActiveSession';
import type { Database } from '../../lib/database.types';

type SetLog = Database['public']['Tables']['set_logs']['Row'];

const RPE_OPTIONS = ['', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

interface ActiveSetRowProps {
  setNumber: number;
  log: SetLog | undefined;
  ghost: GhostValue | undefined;
  onUpdate: (fields: SetUpdateFields) => void;
  onDelete: () => void;
}

export function ActiveSetRow({ setNumber, log, ghost, onUpdate, onDelete }: ActiveSetRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[24px_1fr_1fr_1fr_36px_28px] items-center gap-1.5 py-1',
        log?.completed && 'opacity-60',
      )}
    >
      <span className="text-xs text-zinc-500 text-center">{setNumber}</span>
      <input
        type="number"
        inputMode="numeric"
        value={log?.reps ?? ''}
        placeholder={ghost?.reps != null ? String(ghost.reps) : '-'}
        onChange={(e) => onUpdate({ reps: e.target.value ? Number(e.target.value) : null })}
        className="h-9 w-full rounded-lg border border-zinc-800 bg-surface px-2 text-sm text-zinc-50 text-center placeholder:text-zinc-600 outline-none focus:border-accent"
      />
      <input
        type="number"
        inputMode="decimal"
        value={log?.weight ?? ''}
        placeholder={ghost?.weight != null ? String(ghost.weight) : '-'}
        onChange={(e) => onUpdate({ weight: e.target.value ? Number(e.target.value) : null })}
        className="h-9 w-full rounded-lg border border-zinc-800 bg-surface px-2 text-sm text-zinc-50 text-center placeholder:text-zinc-600 outline-none focus:border-accent"
      />
      <select
        value={log?.rpe ?? ''}
        onChange={(e) => onUpdate({ rpe: e.target.value ? Number(e.target.value) : null })}
        className="h-9 w-full rounded-lg border border-zinc-800 bg-surface px-1 text-xs text-zinc-50 outline-none focus:border-accent"
      >
        {RPE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt || 'RPE'}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onUpdate({ completed: !log?.completed })}
        aria-label="Marcar set completado"
        className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center border',
          log?.completed ? 'bg-accent border-accent text-zinc-950' : 'border-zinc-700 text-transparent',
        )}
      >
        ✓
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar set"
        className="h-9 w-7 flex items-center justify-center text-zinc-600 hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
