import { Dumbbell } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { CatalogListRow } from '../../hooks/useExercisesCatalog';

interface CatalogCardProps {
  exercise: CatalogListRow;
  onClick: () => void;
}

export function CatalogCard({ exercise, onClick }: CatalogCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg bg-surface overflow-hidden hover:ring-1 hover:ring-zinc-700 transition-shadow"
    >
      <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Dumbbell className="text-zinc-600" size={28} />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-50 line-clamp-2 mb-2 capitalize">
          {exercise.name_es ?? exercise.name}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="accent">{exercise.target}</Badge>
          <Badge>{exercise.equipment}</Badge>
        </div>
      </div>
    </button>
  );
}
