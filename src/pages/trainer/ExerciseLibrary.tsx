import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExerciseCard } from '../../components/exercises/ExerciseCard';
import { ExerciseFilters, defaultExerciseFilters, type ExerciseFilterState } from '../../components/exercises/ExerciseFilters';
import { ExerciseDetailModal } from '../../components/exercises/ExerciseDetailModal';
import { ExerciseFormModal } from '../../components/exercises/ExerciseFormModal';
import { SeedLibraryPrompt } from '../../components/exercises/SeedLibraryPrompt';
import { useExercises, type Exercise } from '../../hooks/useExercises';

export default function ExerciseLibrary() {
  const { exercises, loading, createExercise, updateExercise, deleteExercise, seedDefaultLibrary } = useExercises();
  const [filters, setFilters] = useState<ExerciseFilterState>(defaultExerciseFilters);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);

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

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(exercise: Exercise) {
    setSelected(null);
    setEditing(exercise);
    setFormOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Biblioteca de ejercicios"
        action={
          <div className="flex gap-2">
            <Link to="/t/exercises/catalog">
              <Button type="button" variant="secondary" size="md">
                <Library size={18} className="mr-1.5" /> Catálogo
              </Button>
            </Link>
            <Button type="button" onClick={openCreate} size="md">
              <Plus size={18} className="mr-1.5" /> Nuevo
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <SeedLibraryPrompt onSeed={seedDefaultLibrary} />
      ) : (
        <>
          <ExerciseFilters value={filters} onChange={setFilters} />
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-10">No se encontraron ejercicios.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => setSelected(exercise)} />
              ))}
            </div>
          )}
        </>
      )}

      <ExerciseDetailModal
        exercise={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={(exercise) => deleteExercise(exercise.id)}
      />

      <ExerciseFormModal
        open={formOpen}
        exercise={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (editing ? updateExercise(editing.id, payload) : createExercise(payload))}
      />
    </div>
  );
}
