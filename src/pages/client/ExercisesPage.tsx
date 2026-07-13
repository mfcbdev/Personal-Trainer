import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExerciseCard } from '../../components/exercises/ExerciseCard';
import {
  ExerciseFilters,
  defaultExerciseFilters,
  type ExerciseFilterState,
} from '../../components/exercises/ExerciseFilters';
import { ExerciseDetailModal } from '../../components/exercises/ExerciseDetailModal';
import { useExercises, type Exercise } from '../../hooks/useExercises';

export default function ExercisesPage() {
  const { exercises, loading } = useExercises();
  const [filters, setFilters] = useState<ExerciseFilterState>(defaultExerciseFilters);
  const [selected, setSelected] = useState<Exercise | null>(null);

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

  return (
    <div>
      <PageHeader title="Ejercicios" />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-10">
          Tu entrenador aún no ha creado su biblioteca de ejercicios.
        </p>
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

      <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
