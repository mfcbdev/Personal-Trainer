import { Waves, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { CARDIO_MODALITY_LABELS } from '../../lib/constants';
import { cn } from '../../utils/cn';
import type { ActiveSessionExercise } from '../../hooks/useActiveSession';

interface CardioLogCardProps {
  item: ActiveSessionExercise;
  onToggleComplete: (completed: boolean) => void;
}

export function CardioLogCard({ item, onToggleComplete }: CardioLogCardProps) {
  const isFormal = item.item_type === 'cardio_formal';
  const modalityLabel = item.cardio_modality ? CARDIO_MODALITY_LABELS[item.cardio_modality] : null;

  return (
    <Card className={cn(item.completed && 'opacity-60')}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-16 shrink-0 rounded bg-zinc-800 flex items-center justify-center">
          <Waves size={20} className="text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-50">
            {modalityLabel ?? (isFormal ? 'Cardio formal' : 'Caminata')}
          </p>
          <p className="text-xs text-zinc-500">
            {isFormal ? 'Cardio formal' : 'Cardio informal'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleComplete(!item.completed)}
          aria-label="Marcar completado"
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center border shrink-0',
            item.completed
              ? 'bg-accent border-accent text-zinc-950'
              : 'border-zinc-700 text-transparent',
          )}
        >
          <Check size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {!isFormal && item.total_minutes != null && (
          <Metric label="Duración" value={`${item.total_minutes} min`} />
        )}
        {isFormal && (
          <>
            {item.rounds != null && <Metric label="Rondas" value={String(item.rounds)} />}
            {item.work_seconds != null && <Metric label="Trabajo" value={`${item.work_seconds}s`} />}
            {item.rest_seconds != null && <Metric label="Descanso" value={`${item.rest_seconds}s`} />}
            {item.recovery_seconds != null && (
              <Metric label="Recuperación" value={`${item.recovery_seconds}s`} />
            )}
            {item.incline != null && <Metric label="Inclinación" value={`${item.incline}%`} />}
            {item.intensity && <Metric label="Intensidad" value={item.intensity} />}
          </>
        )}
      </div>

      {item.observations && (
        <p className="text-xs text-zinc-400 mt-3 italic whitespace-pre-wrap">{item.observations}</p>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase mb-0.5">{label}</p>
      <p className="text-zinc-50 font-mono">{value}</p>
    </div>
  );
}
