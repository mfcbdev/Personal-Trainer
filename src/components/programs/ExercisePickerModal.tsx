import { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useExercises } from '../../hooks/useExercises';
import { getYouTubeThumbnail } from '../../lib/youtube';

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

export function ExercisePickerModal({ open, onClose, onSelect }: ExercisePickerModalProps) {
  const { exercises, loading } = useExercises();
  const [search, setSearch] = useState('');

  const filtered = exercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal open={open} onClose={onClose} title="Agregar ejercicio" className="max-h-[80vh] flex flex-col">
      <div className="relative mb-3 shrink-0">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="h-11 w-full rounded-lg border border-zinc-800 bg-base pl-10 pr-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
        />
      </div>

      <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-1.5">
        {loading ? (
          <p className="text-sm text-zinc-500 text-center py-6">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">No se encontraron ejercicios.</p>
        ) : (
          filtered.map((exercise) => {
            const thumb = exercise.video_url ? getYouTubeThumbnail(exercise.video_url) : null;
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => {
                  onSelect(exercise.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 rounded-lg bg-base p-2 hover:bg-zinc-800 text-left"
              >
                <div className="h-10 w-14 shrink-0 rounded bg-zinc-800 overflow-hidden">
                  {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-zinc-50 truncate">{exercise.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{exercise.muscle_group}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
