import { cn } from '../../utils/cn';
import type { GhostValue, SetUpdateFields } from '../../hooks/useActiveSession';
import type { Database } from '../../lib/database.types';

type SetLog = Database['public']['Tables']['set_logs']['Row'];

// CF = Cercanía al Fallo (1–10). Stored in the `set_logs.rpe` column — the
// scale semantics changed but the column name is kept to avoid a migration.
const CF_OPTIONS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

interface ActiveSetRowProps {
  setNumber: number;
  log: SetLog | undefined;
  ghost: GhostValue | undefined;
  plannedReps: number | null;
  onUpdate: (fields: SetUpdateFields) => void;
}

export function ActiveSetRow({ setNumber, log, ghost, plannedReps, onUpdate }: ActiveSetRowProps) {
  const displayReps =
    log?.reps ?? ghost?.reps ?? plannedReps ?? null;

  function handleToggleComplete() {
    const nextCompleted = !log?.completed;
    const fields: SetUpdateFields = { completed: nextCompleted };
    // When the alumno marks a set complete without a stored reps value, seed
    // the log with the planned or ghost value so volume calculations remain
    // meaningful downstream.
    if (nextCompleted && log?.reps == null) {
      const fallback = ghost?.reps ?? plannedReps;
      if (fallback != null) fields.reps = fallback;
    }
    onUpdate(fields);
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[24px_1fr_1fr_1fr_36px] items-center gap-1.5 py-1',
        log?.completed && 'opacity-60',
      )}
    >
      <span className="text-xs text-zinc-500 text-center">{setNumber}</span>
      <span className="h-9 flex items-center justify-center text-sm text-zinc-300">
        {displayReps ?? '-'}
      </span>
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
        aria-label="Cercanía al fallo"
        className="h-9 w-full rounded-lg border border-zinc-800 bg-surface px-1 text-xs text-zinc-50 outline-none focus:border-accent"
      >
        {CF_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt || 'CF'}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleToggleComplete}
        aria-label="Marcar set completado"
        className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center border',
          log?.completed ? 'bg-accent border-accent text-zinc-950' : 'border-zinc-700 text-transparent',
        )}
      >
        ✓
      </button>
    </div>
  );
}
