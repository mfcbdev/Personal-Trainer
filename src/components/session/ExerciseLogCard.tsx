import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { ActiveSetRow } from './ActiveSetRow';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../lib/youtube';
import type { ActiveSessionExercise, SetUpdateFields } from '../../hooks/useActiveSession';

interface ExerciseLogCardProps {
  item: ActiveSessionExercise;
  onUpdateSet: (setNumber: number, fields: SetUpdateFields) => void;
  onAddSet: () => void;
  onRemoveSet: (logId: string) => void;
}

export function ExerciseLogCard({ item, onUpdateSet, onAddSet, onRemoveSet }: ExerciseLogCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const thumbnail = item.exercise.video_url ? getYouTubeThumbnail(item.exercise.video_url) : null;
  const embedUrl = item.exercise.video_url ? getYouTubeEmbedUrl(item.exercise.video_url) : null;

  const setCount = Math.max(item.sets ?? 0, item.logs.length, 1);
  const setNumbers = Array.from({ length: setCount }, (_, i) => i + 1);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => embedUrl && setVideoOpen(true)}
          className="h-12 w-16 shrink-0 rounded bg-zinc-800 overflow-hidden"
        >
          {thumbnail && <img src={thumbnail} alt="" className="h-full w-full object-cover" />}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-50 truncate">{item.exercise.name}</p>
          <p className="text-xs text-zinc-500">
            Meta: {item.sets ?? '-'} × {item.reps ?? '-'} {item.weight ? `· ${item.weight}kg` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[24px_1fr_1fr_1fr_36px_28px] gap-1.5 mb-1 px-0.5">
        <span />
        <span className="text-[10px] text-zinc-500 text-center">Reps</span>
        <span className="text-[10px] text-zinc-500 text-center">Kg</span>
        <span className="text-[10px] text-zinc-500 text-center">RPE</span>
        <span />
        <span />
      </div>

      {setNumbers.map((setNumber) => {
        const log = item.logs.find((l) => l.set_number === setNumber);
        const ghost = item.ghosts[setNumber - 1];
        return (
          <ActiveSetRow
            key={setNumber}
            setNumber={setNumber}
            log={log}
            ghost={ghost}
            onUpdate={(fields) => onUpdateSet(setNumber, fields)}
            onDelete={() => log && onRemoveSet(log.id)}
          />
        );
      })}

      <button
        type="button"
        onClick={onAddSet}
        className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
      >
        <Plus size={14} /> Agregar set
      </button>

      {videoOpen && embedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setVideoOpen(false)}>
          <div className="w-full max-w-lg aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src={embedUrl} title={item.exercise.name} className="h-full w-full rounded-lg" allowFullScreen />
          </div>
        </div>
      )}
    </Card>
  );
}
