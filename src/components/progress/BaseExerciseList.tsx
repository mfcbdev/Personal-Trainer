import { Trophy } from 'lucide-react';
import type { BaseExerciseProgress } from '../../hooks/useClientProgress';

export function BaseExerciseList({ items }: { items: BaseExerciseProgress[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-6">
        Completa sesiones para ver el progreso de cada ejercicio.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800">
      {items.map((item) => (
        <li key={item.exerciseId} className="py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-50 truncate">{item.name}</p>
            <p className="text-xs text-zinc-500 truncate">
              {item.muscleGroup} · {item.sessionCount} sesión{item.sessionCount === 1 ? '' : 'es'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-mono text-zinc-50">
              {item.currentMaxWeight} kg
              {item.bestReps > 0 && <span className="text-zinc-500"> × {item.bestReps}</span>}
            </p>
            {item.deltaPct != null && item.deltaPct !== 0 ? (
              <p
                className={`text-[10px] font-mono flex items-center justify-end gap-1 ${
                  item.deltaPct > 0 ? 'text-accent' : 'text-red-400'
                }`}
              >
                {item.deltaPct > 0 && <Trophy size={10} />}
                {item.deltaPct > 0 ? '+' : ''}
                {item.deltaPct}%
              </p>
            ) : (
              <p className="text-[10px] font-mono text-zinc-500">Base</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
