import { useState, type DragEvent, type ReactNode } from 'react';
import { GripVertical, ChevronDown, Trash2, Play } from 'lucide-react';
import { cn } from '../../utils/cn';
import { resolveVideoSource } from '../../lib/video-source';
import type { SessionExerciseWithExercise } from '../../hooks/useSessionDetail';
import type { Database } from '../../lib/database.types';

type SessionExerciseUpdate = Database['public']['Tables']['session_exercises']['Update'];

interface SessionExerciseRowProps {
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

export function SessionExerciseRow({ item, onUpdate, onRemove, dragProps }: SessionExerciseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const video = resolveVideoSource(item.exercise.video_url);

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
        <div className="h-10 w-14 shrink-0 rounded bg-zinc-800 overflow-hidden flex items-center justify-center">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : video.kind === 'file' ? (
            <Play size={14} className="text-zinc-500" />
          ) : null}
        </div>
        <button type="button" onClick={() => setExpanded((e) => !e)} className="flex-1 text-left min-w-0">
          <p className="text-sm text-zinc-50 truncate">{item.exercise.name}</p>
          <p className="text-xs text-zinc-500">
            {item.sets ?? '-'} × {item.reps ?? '-'} {item.weight ? `· ${item.weight}kg` : ''}
          </p>
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
          aria-label="Eliminar ejercicio"
          className="h-9 w-9 flex items-center justify-center text-zinc-500 hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-3">
          <Field label="Series">
            <input
              type="number"
              min={0}
              value={item.sets ?? ''}
              onChange={(e) => onUpdate({ sets: e.target.value ? Number(e.target.value) : null })}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
          <Field label="Reps">
            <input
              type="text"
              value={item.reps ?? ''}
              onChange={(e) => onUpdate({ reps: e.target.value })}
              placeholder="10-12"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
          <Field label="Peso (kg)">
            <input
              type="number"
              step="0.5"
              value={item.weight ?? ''}
              onChange={(e) => onUpdate({ weight: e.target.value ? Number(e.target.value) : null })}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
          <Field label="RIR / RPE">
            <input
              type="text"
              value={item.rir_rpe ?? ''}
              onChange={(e) => onUpdate({ rir_rpe: e.target.value })}
              placeholder="RIR 2"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
          <Field label="Descanso">
            <input
              type="text"
              value={item.rest ?? ''}
              onChange={(e) => onUpdate({ rest: e.target.value })}
              placeholder="90s"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </Field>
          <Field label="Notas" full>
            <input
              type="text"
              value={item.notes ?? ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
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
