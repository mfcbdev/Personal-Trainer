import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExerciseLogCard } from '../../components/session/ExerciseLogCard';
import { CardioLogCard } from '../../components/session/CardioLogCard';
import { RestTimerBanner } from '../../components/session/RestTimerBanner';
import { useActiveSession, type SetUpdateFields } from '../../hooks/useActiveSession';
import { useToast } from '../../contexts/ToastContext';
import { parseRestSeconds } from '../../lib/scheduling';

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SessionPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { session, items, loading, upsertSetLog, setCardioCompleted, completeWorkout } =
    useActiveSession(sessionId);

  const [elapsed, setElapsed] = useState(0);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restKey, setRestKey] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !session) {
    return (
      <div>
        <PageHeader title="Sesión" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  async function handleSetUpdate(sessionExerciseId: string, setNumber: number, fields: SetUpdateFields) {
    try {
      await upsertSetLog(sessionExerciseId, setNumber, fields);
      if (fields.completed) {
        const item = items.find((i) => i.id === sessionExerciseId);
        setRestSeconds(parseRestSeconds(item?.rest ?? null));
        setRestKey((k) => k + 1);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar el set.');
    }
  }

  async function handleFinish() {
    setFinishing(true);
    try {
      await completeWorkout();
      setShowSummary(true);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo finalizar la sesión.');
    } finally {
      setFinishing(false);
    }
  }

  if (showSummary) {
    const totalVolume = items.reduce(
      (sum, item) =>
        sum + item.logs.filter((l) => l.completed).reduce((s, l) => s + (l.reps ?? 0) * (l.weight ?? 0), 0),
      0,
    );
    const exercisesCompleted = items.filter((item) =>
      item.item_type === 'strength' ? item.logs.some((l) => l.completed) : item.completed,
    ).length;
    const prExercises = items.filter((item) => {
      const todayMax = Math.max(0, ...item.logs.filter((l) => l.completed).map((l) => l.weight ?? 0));
      const historyMax = Math.max(0, ...item.ghosts.map((g) => g.weight ?? 0));
      return todayMax > 0 && todayMax > historyMax;
    });

    return (
      <div className="flex flex-col items-center text-center py-10">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <Check size={32} className="text-zinc-950" />
        </div>
        <h1 className="font-display text-xl font-semibold text-zinc-50 mb-1">¡Entrenamiento completado!</h1>
        <p className="text-sm text-zinc-400 mb-6">Duración: {formatElapsed(elapsed)}</p>

        <Card className="w-full max-w-sm space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Volumen total</span>
            <span className="text-zinc-50 font-medium">{totalVolume.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Ejercicios completados</span>
            <span className="text-zinc-50 font-medium">
              {exercisesCompleted}/{items.length}
            </span>
          </div>
          {prExercises.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Récords personales</span>
              <span className="text-accent font-medium">{prExercises.length} 🏆</span>
            </div>
          )}
        </Card>

        <Button type="button" size="lg" className="w-full max-w-sm" onClick={() => navigate('/c/today')}>
          Volver a Hoy
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-lg font-semibold text-zinc-50">
            {session.name || `Sesión ${session.session_number}`}
          </h1>
          <p className="font-mono text-sm text-zinc-400">{formatElapsed(elapsed)}</p>
        </div>
        <Button type="button" variant="secondary" onClick={handleFinish} disabled={finishing}>
          Finalizar
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) =>
          item.item_type === 'strength' ? (
            <ExerciseLogCard
              key={item.id}
              item={item}
              onUpdateSet={(setNumber, fields) => handleSetUpdate(item.id, setNumber, fields)}
            />
          ) : (
            <CardioLogCard
              key={item.id}
              item={item}
              onToggleComplete={(completed) => setCardioCompleted(item.id, completed)}
            />
          ),
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-base/95 backdrop-blur border-t border-zinc-800">
        <Button type="button" size="lg" className="w-full" onClick={handleFinish} disabled={finishing}>
          {finishing ? 'Guardando...' : 'Completar entrenamiento'}
        </Button>
      </div>

      {restSeconds !== null && (
        <RestTimerBanner key={restKey} seconds={restSeconds} onDismiss={() => setRestSeconds(null)} />
      )}
    </div>
  );
}
