import { useState, type DragEvent, type ReactNode } from 'react';
import { GripVertical, ChevronDown, Trash2, Waves } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CARDIO_MODALITY_LABELS } from '../../lib/constants';
import type { SessionExerciseWithExercise } from '../../hooks/useSessionDetail';
import type { CardioModality, Database } from '../../lib/database.types';

type SessionExerciseUpdate = Database['public']['Tables']['session_exercises']['Update'];

interface SessionCardioRowProps {
  item: SessionExerciseWithExercise;
  onUpdate: (fields: SessionExerciseUpdate) => void;
  onRemove: () => void;
  dragProps: {
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: DragEvent) => void;
    onDrop: () => void;
  };
}

const FORMAL_MODALITIES: CardioModality[] = ['cinta', 'eliptica', 'estatica'];

export function SessionCardioRow({ item, onUpdate, onRemove, dragProps }: SessionCardioRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isFormal = item.item_type === 'cardio_formal';
  const summary = isFormal
    ? [
        item.cardio_modality ? CARDIO_MODALITY_LABELS[item.cardio_modality] : 'Cardio formal',
        item.rounds ? `${item.rounds} rondas` : null,
        item.work_seconds ? `${item.work_seconds}s trabajo` : null,
        item.rest_seconds ? `${item.rest_seconds}s descanso` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : `Caminata · ${item.total_minutes ?? '—'} min`;

  return (
    <div
      draggable={dragProps.draggable}
      onDragStart={dragProps.onDragStart}
      onDragOver={dragProps.onDragOver}
      onDrop={dragProps.onDrop}
      className="rounded-lg bg-surface"
    >
      <div className="flex items-center gap-2 p-3">
        <GripVertical size={16} className="text-zinc-600 cursor-grab shrink-0" />
        <div className="h-10 w-14 shrink-0 rounded bg-zinc-800 flex items-center justify-center">
          <Waves size={16} className="text-zinc-400" />
        </div>
        <button type="button" onClick={() => setExpanded((e) => !e)} className="flex-1 text-left min-w-0">
          <p className="text-sm text-zinc-50 truncate">
            {isFormal ? 'Cardio formal' : 'Caminata'}
          </p>
          <p className="text-xs text-zinc-500 truncate">{summary}</p>
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-label="Expandir"
          className="h-9 w-9 flex items-center justify-center text-zinc-500"
        >
          <ChevronDown size={16} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar cardio"
          className="h-9 w-9 flex items-center justify-center text-zinc-500 hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-3">
          {isFormal ? (
            <>
              <Field label="Modalidad" full>
                <select
                  value={item.cardio_modality ?? 'cinta'}
                  onChange={(e) => onUpdate({ cardio_modality: e.target.value as CardioModality })}
                  className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
                >
                  {FORMAL_MODALITIES.map((m) => (
                    <option key={m} value={m}>
                      {CARDIO_MODALITY_LABELS[m]}
                    </option>
                  ))}
                </select>
              </Field>
              <NumberField
                label="Rondas"
                value={item.rounds}
                onChange={(v) => onUpdate({ rounds: v })}
              />
              <NumberField
                label="Trabajo (s)"
                value={item.work_seconds}
                onChange={(v) => onUpdate({ work_seconds: v })}
              />
              <NumberField
                label="Descanso (s)"
                value={item.rest_seconds}
                onChange={(v) => onUpdate({ rest_seconds: v })}
              />
              <NumberField
                label="Recuperación (s)"
                value={item.recovery_seconds}
                onChange={(v) => onUpdate({ recovery_seconds: v })}
              />
              <NumberField
                label="Inclinación (%)"
                value={item.incline}
                onChange={(v) => onUpdate({ incline: v })}
                step="0.5"
              />
              <Field label="Intensidad" full>
                <input
                  type="text"
                  value={item.intensity ?? ''}
                  onChange={(e) => onUpdate({ intensity: e.target.value })}
                  placeholder="Ej. Zona 4 · alta"
                  className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
                />
              </Field>
            </>
          ) : (
            <NumberField
              label="Duración total (min)"
              value={item.total_minutes}
              onChange={(v) => onUpdate({ total_minutes: v })}
              full
            />
          )}
          <Field label="Observaciones" full>
            <textarea
              value={item.observations ?? ''}
              onChange={(e) => onUpdate({ observations: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-800 bg-base px-3 py-2 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  full,
  step,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  full?: boolean;
  step?: string;
}) {
  return (
    <Field label={label} full={full}>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
      />
    </Field>
  );
}
