import { Dumbbell, Play } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { resolveVideoSource } from '../../lib/video-source';
import { ZONE_LABELS } from '../../lib/constants';
import type { Exercise } from '../../hooks/useExercises';

export function ExerciseCard({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  const video = resolveVideoSource(exercise.video_url);

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg bg-surface overflow-hidden hover:ring-1 hover:ring-zinc-700 transition-shadow"
    >
      <div className="aspect-video bg-zinc-800 flex items-center justify-center">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : video.kind === 'file' ? (
          <Play className="text-zinc-500" size={22} />
        ) : (
          <Dumbbell className="text-zinc-600" size={28} />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-50 line-clamp-2 mb-2">{exercise.name}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="accent">{exercise.muscle_group}</Badge>
          <Badge>{ZONE_LABELS[exercise.zone]}</Badge>
        </div>
      </div>
    </button>
  );
}
