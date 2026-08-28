import { useMemo, useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExerciseCard } from '../exercises/ExerciseCard';
import { ExerciseFilters, defaultExerciseFilters, type ExerciseFilterState } from '../exercises/ExerciseFilters';
import { NumberStepper } from '../onboarding/NumberStepper';
import { useExercises, type Exercise } from '../../hooks/useExercises';
import { resolveVideoSource } from '../../lib/video-source';
import { CARDIO_MODALITY_LABELS } from '../../lib/constants';
import type { CardioModality } from '../../lib/database.types';
import { cn } from '../../utils/cn';

export interface ExerciseQuickConfig {
  sets: number | null;
  reps: string | null;
  weight: number | null;
}

export interface CardioInformalPayload {
  total_minutes: number | null;
  observations: string | null;
}

export interface CardioFormalPayload {
  cardio_modality: CardioModality;
  rounds: number | null;
  work_seconds: number | null;
  rest_seconds: number | null;
  recovery_seconds: number | null;
  incline: number | null;
  intensity: string | null;
  observations: string | null;
}

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string, config: ExerciseQuickConfig) => void;
  onSelectCardioInformal: (payload: CardioInformalPayload) => void;
  onSelectCardioFormal: (payload: CardioFormalPayload) => void;
}

type Mode = 'strength' | 'cardio_informal' | 'cardio_formal';

const FORMAL_MODALITIES: CardioModality[] = ['cinta', 'eliptica', 'estatica'];

export function ExercisePickerModal({
  open,
  onClose,
  onSelectExercise,
  onSelectCardioInformal,
  onSelectCardioFormal,
}: ExercisePickerModalProps) {
  const [mode, setMode] = useState<Mode>('strength');

  function reset() {
    setMode('strength');
    onClose();
  }

  return (
    <Modal open={open} onClose={reset} title="Agregar">
      <div className="flex gap-2 mb-4">
        <ModeChip active={mode === 'strength'} onClick={() => setMode('strength')}>
          Ejercicio
        </ModeChip>
        <ModeChip active={mode === 'cardio_informal'} onClick={() => setMode('cardio_informal')}>
          Cardio informal
        </ModeChip>
        <ModeChip active={mode === 'cardio_formal'} onClick={() => setMode('cardio_formal')}>
          Cardio formal
        </ModeChip>
      </div>

      {mode === 'strength' && (
        <StrengthPicker
          onSelect={(id, config) => {
            onSelectExercise(id, config);
            reset();
          }}
        />
      )}
      {mode === 'cardio_informal' && (
        <CardioInformalForm
          onSubmit={(payload) => {
            onSelectCardioInformal(payload);
            reset();
          }}
        />
      )}
      {mode === 'cardio_formal' && (
        <CardioFormalForm
          onSubmit={(payload) => {
            onSelectCardioFormal(payload);
            reset();
          }}
        />
      )}
    </Modal>
  );
}

function ModeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-full text-xs font-medium shrink-0',
        active ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400',
      )}
    >
      {children}
    </button>
  );
}

function StrengthPicker({
  onSelect,
}: {
  onSelect: (exerciseId: string, config: ExerciseQuickConfig) => void;
}) {
  const { exercises, loading } = useExercises();
  const [filters, setFilters] = useState<ExerciseFilterState>(defaultExerciseFilters);
  const [picked, setPicked] = useState<Exercise | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10-12');
  const [weight, setWeight] = useState(0);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (filters.zone !== 'all' && ex.zone !== filters.zone) return false;
      if (filters.movementType !== 'all' && ex.movement_type !== filters.movementType) return false;
      if (filters.muscleGroup !== 'all' && ex.muscle_group !== filters.muscleGroup) return false;
      if (search && !ex.name.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [exercises, filters]);

  if (picked) {
    const video = resolveVideoSource(picked.video_url);
    return (
      <>
        <button
          type="button"
          onClick={() => setPicked(null)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 mb-4"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-14 w-20 shrink-0 rounded bg-zinc-800 overflow-hidden flex items-center justify-center">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : video.kind === 'file' ? (
              <Play size={18} className="text-zinc-500" />
            ) : null}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-50">{picked.name}</p>
            <p className="text-xs text-zinc-500">{picked.muscle_group}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Series</label>
            <NumberStepper value={sets} onChange={setSets} min={1} max={20} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Repeticiones</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10-12"
              className="h-11 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Peso (kg)</label>
            <NumberStepper value={weight} onChange={setWeight} min={0} max={500} step={2.5} suffix="kg" />
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => onSelect(picked.id, { sets, reps, weight: weight || null })}
        >
          Agregar a la sesión
        </Button>
      </>
    );
  }

  return (
    <>
      <ExerciseFilters value={filters} onChange={setFilters} />
      {loading ? (
        <p className="text-sm text-zinc-500 text-center py-6">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">No se encontraron ejercicios.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => setPicked(exercise)} />
          ))}
        </div>
      )}
    </>
  );
}

function CardioInformalForm({ onSubmit }: { onSubmit: (payload: CardioInformalPayload) => void }) {
  const [minutes, setMinutes] = useState(30);
  const [observations, setObservations] = useState('');

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Caminata — sólo duración y observaciones.</p>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Duración total (min)</label>
        <NumberStepper value={minutes} onChange={setMinutes} min={1} max={240} suffix="min" />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Observaciones</label>
        <textarea
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-lg border border-zinc-800 bg-base px-3 py-2 text-sm text-zinc-50 outline-none focus:border-accent"
        />
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() =>
          onSubmit({
            total_minutes: minutes || null,
            observations: observations.trim() || null,
          })
        }
      >
        Agregar cardio informal
      </Button>
    </div>
  );
}

function CardioFormalForm({ onSubmit }: { onSubmit: (payload: CardioFormalPayload) => void }) {
  const [modality, setModality] = useState<CardioModality>('cinta');
  const [rounds, setRounds] = useState(6);
  const [work, setWork] = useState(60);
  const [rest, setRest] = useState(30);
  const [recovery, setRecovery] = useState(0);
  const [incline, setIncline] = useState('');
  const [intensity, setIntensity] = useState('');
  const [observations, setObservations] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Modalidad</label>
        <select
          value={modality}
          onChange={(e) => setModality(e.target.value as CardioModality)}
          className="h-11 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
        >
          {FORMAL_MODALITIES.map((m) => (
            <option key={m} value={m}>
              {CARDIO_MODALITY_LABELS[m]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Rondas" value={rounds} onChange={setRounds} />
        <NumField label="Trabajo (s)" value={work} onChange={setWork} />
        <NumField label="Descanso (s)" value={rest} onChange={setRest} />
        <NumField label="Recuperación (s)" value={recovery} onChange={setRecovery} />
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Inclinación (%)</label>
          <input
            type="number"
            step="0.5"
            value={incline}
            onChange={(e) => setIncline(e.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Intensidad</label>
          <input
            type="text"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            placeholder="Ej. Zona 4"
            className="h-11 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Observaciones</label>
        <textarea
          rows={2}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-lg border border-zinc-800 bg-base px-3 py-2 text-sm text-zinc-50 outline-none focus:border-accent"
        />
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() =>
          onSubmit({
            cardio_modality: modality,
            rounds: rounds || null,
            work_seconds: work || null,
            rest_seconds: rest || null,
            recovery_seconds: recovery || null,
            incline: incline ? Number(incline) : null,
            intensity: intensity.trim() || null,
            observations: observations.trim() || null,
          })
        }
      >
        Agregar cardio formal
      </Button>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
        className="h-11 w-full rounded-lg border border-zinc-800 bg-base px-3 text-sm text-zinc-50 outline-none focus:border-accent"
      />
    </div>
  );
}
