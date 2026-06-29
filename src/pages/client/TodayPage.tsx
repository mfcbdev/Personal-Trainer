import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { AdherenceBar } from '../../components/client/AdherenceBar';
import { useActiveProgram } from '../../hooks/useActiveProgram';
import { useSessionDetail } from '../../hooks/useSessionDetail';
import { flattenSessions, todayISODate } from '../../lib/program-utils';
import { getCurrentWeekStart, estimateSessionMinutes } from '../../lib/scheduling';

export default function TodayPage() {
  const navigate = useNavigate();
  const { data, loading, hasActiveProgram } = useActiveProgram();

  if (loading) {
    return (
      <div>
        <PageHeader title="Hoy" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!hasActiveProgram || !data) {
    return (
      <div>
        <PageHeader title="Hoy" />
        <Card className="text-center">
          <p className="text-sm text-zinc-400">
            Aún no tienes un programa activo. Tu entrenador te lo asignará pronto.
          </p>
        </Card>
      </div>
    );
  }

  const flat = flattenSessions(data);
  const today = todayISODate();
  const todayEntry = flat.find((f) => f.session.scheduled_date === today);
  const upcoming = flat
    .filter((f) => f.session.scheduled_date && f.session.scheduled_date > today)
    .sort((a, b) => (a.session.scheduled_date! < b.session.scheduled_date! ? -1 : 1))[0];

  const weekStart = getCurrentWeekStart();

  return (
    <div>
      <PageHeader title="Hoy" />

      {todayEntry ? (
        <TodaySessionCard sessionId={todayEntry.session.id} onStart={() => navigate(`/c/session/${todayEntry.session.id}`)} />
      ) : (
        <Card className="text-center mb-5">
          <p className="text-sm font-medium text-zinc-200 mb-1">Día de descanso</p>
          <p className="text-sm text-zinc-500 mb-3">Aprovecha para recuperarte. ¡Lo estás haciendo muy bien!</p>
          {upcoming && (
            <p className="text-xs text-zinc-500">
              Próxima sesión: Sesión {upcoming.session.session_number} · {upcoming.session.scheduled_date}
            </p>
          )}
        </Card>
      )}

      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Esta semana</h3>
        <AdherenceBar weekStart={weekStart} sessions={flat} />
      </Card>
    </div>
  );
}

function TodaySessionCard({ sessionId, onStart }: { sessionId: string; onStart: () => void }) {
  const { session, items, loading } = useSessionDetail(sessionId);

  if (loading || !session) return <Skeleton className="h-48 mb-5" />;

  const minutes = estimateSessionMinutes(items);

  return (
    <Card className="mb-5">
      <p className="text-xs text-zinc-500 uppercase mb-1">Entrenamiento de hoy</p>
      <h2 className="font-display text-xl font-semibold text-zinc-50 mb-1">
        {session.name || `Sesión ${session.session_number}`}
      </h2>
      <p className="text-sm text-zinc-400 mb-4">
        {items.length} ejercicios · ~{minutes} min
      </p>

      <ul className="space-y-1.5 mb-5">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="text-sm text-zinc-300 flex justify-between">
            <span className="truncate">{item.exercise.name}</span>
            <span className="text-zinc-500 shrink-0 ml-2">
              {item.sets ?? '-'}×{item.reps ?? '-'}
            </span>
          </li>
        ))}
        {items.length > 5 && <li className="text-xs text-zinc-500">+{items.length - 5} más</li>}
      </ul>

      <Button type="button" size="lg" className="w-full" onClick={onStart}>
        <Play size={18} className="mr-2" /> Comenzar entrenamiento
      </Button>
    </Card>
  );
}
