import { useMemo, useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExerciseCard } from '../exercises/ExerciseCard';
import { ExerciseFilters, defaultExerciseFilters, type ExerciseFilterState } from '../exercises/ExerciseFilters';
import { NumberStepper } from '../onboarding/NumberStepper';
import { useExercises, type Exercise } from '../../hooks/useExercises';
import { resolveVideoSource } from '../../lib/video-source';

export interface ExerciseQuickConfig {
  sets: number | null;
  reps: string | null;
  weight: number | null;
}

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string, config: ExerciseQuickConfig) => void;
}

export function ExercisePickerModal({ open, onClose, onSelect }: ExercisePickerModalProps) {
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

  function handleClose() {
    setPicked(null);
    setSets(3);
    setReps('10-12');
    setWeight(0);
    onClose();
  }

  function handleConfirm() {
    if (!picked) return;
    onSelect(picked.id, { sets, reps, weight: weight || null });
    handleClose();
  }

  if (picked) {
    const video = resolveVideoSource(picked.video_url);
    return (
      <Modal open={open} onClose={handleClose} title="Configurar ejercicio">
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

        <Button type="button" size="lg" className="w-full" onClick={handleConfirm}>
          Agregar a la sesión
        </Button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Agregar ejercicio">
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
    </Modal>
  );
}
