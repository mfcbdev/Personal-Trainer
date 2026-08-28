import { useState } from 'react';
import { Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { ActiveSetRow } from './ActiveSetRow';
import { resolveVideoSource } from '../../lib/video-source';
import type { ActiveSessionExercise, SetUpdateFields } from '../../hooks/useActiveSession';

interface ExerciseLogCardProps {
  item: ActiveSessionExercise;
  onUpdateSet: (setNumber: number, fields: SetUpdateFields) => void;
}

// Extract the first integer from a planned reps string like "10-12" or "12".
// Returns null when no digit is present (e.g. "AMRAP").
function parsePlannedReps(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function ExerciseLogCard({ item, onUpdateSet }: ExerciseLogCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  // Strength-only component — cardio items are handled by CardioLogCard.
  if (!item.exercise) return null;
  const exercise = item.exercise;
  const video = resolveVideoSource(exercise.video_url);

  // Alumno can't add sets — session cardinality is fixed by the coach.
  const setCount = Math.max(item.sets ?? 1, 1);
  const setNumbers = Array.from({ length: setCount }, (_, i) => i + 1);
  const plannedReps = parsePlannedReps(item.reps);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => video.playerUrl && setVideoOpen(true)}
          disabled={!video.playerUrl}
          className="h-12 w-16 shrink-0 rounded bg-zinc-800 overflow-hidden flex items-center justify-center"
        >
          {video.thumbnail ? (
            <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : video.kind === 'file' ? (
            <Play size={16} className="text-zinc-400" />
          ) : null}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-50 truncate">{exercise.name}</p>
          <p className="text-xs text-zinc-500">
            Meta: {item.sets ?? '-'} × {item.reps ?? '-'} {item.weight ? `· ${item.weight}kg` : ''}
          </p>
          {item.notes && (
            <p className="text-xs text-zinc-500 mt-1 italic">{item.notes}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[24px_1fr_1fr_1fr_36px] gap-1.5 mb-1 px-0.5">
        <span />
        <span className="text-[10px] text-zinc-500 text-center">Reps</span>
        <span className="text-[10px] text-zinc-500 text-center">Kg</span>
        <span className="text-[10px] text-zinc-500 text-center">CF</span>
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
            plannedReps={plannedReps}
            onUpdate={(fields) => onUpdateSet(setNumber, fields)}
          />
        );
      })}

      {videoOpen && video.playerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setVideoOpen(false)}>
          <div className="w-full max-w-lg aspect-video" onClick={(e) => e.stopPropagation()}>
            {video.kind === 'youtube' ? (
              <iframe src={video.playerUrl} title={exercise.name} className="h-full w-full rounded-lg" allowFullScreen />
            ) : (
              <video src={video.playerUrl} controls autoPlay playsInline className="h-full w-full rounded-lg bg-black" />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
