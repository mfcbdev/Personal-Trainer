import { Minus, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { GhostValue, SetUpdateFields } from '../../hooks/useActiveSession';
import type { Database } from '../../lib/database.types';

type SetLog = Database['public']['Tables']['set_logs']['Row'];

// CF = Cercanía al Fallo (1–10). Stored in `set_logs.rpe` — the scale
// semantics changed but the column name is kept to avoid a migration.
// Legacy half-step values are normalised to integers by migration 026.
const CF_OPTIONS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

interface ActiveSetRowProps {
  setNumber: number;
  log: SetLog | undefined;
  ghost: GhostValue | undefined;
  plannedReps: number | null;
  onUpdate: (fields: SetUpdateFields) => void;
}

export function ActiveSetRow({ setNumber, log, ghost, plannedReps, onUpdate }: ActiveSetRowProps) {
  // Reps model (Notion 2.6 hybrid): the alumno can NOT freely edit reps.
  // The prescribed value is shown read-only; a "–" button lets the alumno
  // report "did fewer than prescribed" by decrementing from the target,
  // and a "↺" reset returns to the prescription. On complete, if the
  // alumno hasn't adjusted, we seed log.reps with the plan so downstream
  // volume math has a real number rather than null.
  const anchor = plannedReps ?? ghost?.reps ?? null;
  const displayValue = log?.reps ?? anchor;
  const hasManualAdjustment = log?.reps != null && anchor != null && log.reps !== anchor;
  const canDecrement = (displayValue ?? 0) > 0;

  function decrementReps() {
    const current = displayValue ?? 0;
    if (current <= 0) return;
    onUpdate({ reps: Math.max(0, current - 1) });
  }

  function resetReps() {
    onUpdate({ reps: null });
  }

  function handleToggleComplete() {
    const nextCompleted = !log?.completed;
    const fields: SetUpdateFields = { completed: nextCompleted };
    // Seed reps from the anchor when the alumno taps complete without any
    // adjustment — implicit "did as prescribed". They still have the "–"
    // button to correct AFTER completing if fatigue hits.
    if (nextCompleted && log?.reps == null && anchor != null) {
      fields.reps = anchor;
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

      <div className="flex items-center gap-1 h-9 rounded-lg border border-zinc-800 bg-surface px-1.5">
        <button
          type="button"
          onClick={decrementReps}
          disabled={!canDecrement}
          aria-label="Hice menos reps"
          className={cn(
            'h-6 w-6 flex items-center justify-center rounded text-zinc-400',
            canDecrement ? 'hover:bg-zinc-800 hover:text-zinc-100' : 'opacity-40 cursor-not-allowed',
          )}
        >
          <Minus size={12} />
        </button>
        <span
          className={cn(
            'flex-1 text-center text-sm tabular-nums',
            log?.reps != null ? 'text-zinc-50' : 'text-zinc-500',
          )}
        >
          {displayValue ?? '-'}
        </span>
        {hasManualAdjustment && (
          <button
            type="button"
            onClick={resetReps}
            aria-label="Restaurar reps prescritas"
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      <input
        type="number"
        inputMode="decimal"
        value={log?.weight ?? ''}
        placeholder={ghost?.weight != null ? String(ghost.weight) : '-'}
        onChange={(e) => onUpdate({ weight: e.target.value ? Number(e.target.value) : null })}
        aria-label="Peso (kg)"
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
