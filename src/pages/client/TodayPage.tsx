import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Dumbbell, LineChart, Sparkles, Play, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { AdherenceBar } from '../../components/client/AdherenceBar';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProgram } from '../../hooks/useActiveProgram';
import { useSessionDetail } from '../../hooks/useSessionDetail';
import { flattenSessions, todayISODate } from '../../lib/program-utils';
import { getCurrentWeekStart, estimateSessionMinutes } from '../../lib/scheduling';

function firstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(' ');
  return space > 0 ? trimmed.slice(0, space) : trimmed;
}

export default function TodayPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, loading, hasActiveProgram } = useActiveProgram();

  const name = firstName(profile?.full_name);

  return (
    <div>
      <Header name={name} />

      {loading || !data ? (
        <Skeleton className="h-40 mb-5" />
      ) : (
        <TrainingHero
          sessions={flattenSessions(data)}
          hasActiveProgram={hasActiveProgram}
          onStart={(sessionId) => navigate(`/c/session/${sessionId}`)}
        />
      )}

      <MiniCardGrid />

      <AIPromptCard onOpen={() => navigate('/c/tracking')} />

      {hasActiveProgram && data && (
        <Card className="mt-5">
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Esta semana</h3>
          <AdherenceBar weekStart={getCurrentWeekStart()} sessions={flattenSessions(data)} />
        </Card>
      )}
    </div>
  );
}

function Header({ name }: { name: string }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="text-xs text-zinc-500 mb-1">Bienvenido</p>
        <h1 className="font-display text-2xl font-semibold text-zinc-50">
          Hola, <span className="italic">{name || 'atleta'}</span>
        </h1>
      </div>
      <button
        type="button"
        aria-label="Notificaciones"
        className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-zinc-300 border border-zinc-800"
      >
        <Bell size={16} />
      </button>
    </div>
  );
}

interface TrainingHeroProps {
  sessions: ReturnType<typeof flattenSessions>;
  hasActiveProgram: boolean;
  onStart: (sessionId: string) => void;
}

function TrainingHero({ sessions, hasActiveProgram, onStart }: TrainingHeroProps) {
  const today = todayISODate();
  const todayEntry = sessions.find((f) => f.session.scheduled_date === today);
  const upcoming = sessions
    .filter((f) => f.session.scheduled_date && f.session.scheduled_date > today)
    .sort((a, b) => (a.session.scheduled_date! < b.session.scheduled_date! ? -1 : 1))[0];

  if (!hasActiveProgram) {
    return (
      <Card className="mb-5 text-center">
        <p className="text-sm text-zinc-400">
          Aún no tienes un programa activo. Tu entrenador te lo asignará pronto.
        </p>
      </Card>
    );
  }

  if (todayEntry) {
    return (
      <TodaySessionHero
        sessionId={todayEntry.session.id}
        onStart={() => onStart(todayEntry.session.id)}
      />
    );
  }

  return (
    <div className="mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/25 via-surface to-surface p-6 min-h-[150px] flex flex-col justify-between border border-zinc-800">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-accent">Día de descanso</p>
        <p className="font-display text-lg font-semibold text-zinc-50 mt-1">
          Aprovecha para recuperarte
        </p>
      </div>
      {upcoming && (
        <p className="text-xs text-zinc-400">
          Próxima sesión: Sesión {upcoming.session.session_number} · {upcoming.session.scheduled_date}
        </p>
      )}
    </div>
  );
}

function TodaySessionHero({ sessionId, onStart }: { sessionId: string; onStart: () => void }) {
  const { session, items, loading } = useSessionDetail(sessionId);

  if (loading || !session) return <Skeleton className="h-40 mb-5" />;

  const minutes = estimateSessionMinutes(items);

  return (
    <button
      type="button"
      onClick={onStart}
      className="mb-5 w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/40 via-accent/10 to-surface p-6 min-h-[150px] flex flex-col justify-between border border-zinc-800 hover:from-accent/50 transition-colors"
    >
      <div>
        <p className="text-[11px] uppercase tracking-wide text-zinc-300">Sesión de hoy</p>
        <p className="font-display text-2xl italic font-semibold text-zinc-50 mt-1">
          Entrenar
        </p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-100 font-medium truncate">
            {session.name || `Sesión ${session.session_number}`}
          </p>
          <p className="text-xs text-zinc-300 mt-0.5">
            {items.length} ejercicios · ~{minutes} min
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-accent text-zinc-950 flex items-center justify-center shrink-0">
          <Play size={16} />
        </div>
      </div>
    </button>
  );
}

interface MiniCardProps {
  to: string;
  icon: typeof Calendar;
  label: string;
}

function MiniCard({ to, icon: Icon, label }: MiniCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="rounded-2xl bg-surface border border-zinc-800 p-4 flex flex-col items-start gap-4 text-left hover:border-zinc-700 transition-colors min-h-[110px] justify-between"
    >
      <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
        <Icon size={16} className="text-zinc-300" />
      </div>
      <span className="text-sm font-medium text-zinc-100 leading-tight">{label}</span>
    </button>
  );
}

function MiniCardGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <MiniCard to="/c/calendar" icon={Calendar} label="Mi Programa" />
      <MiniCard to="/c/progress" icon={LineChart} label="Mi Progreso" />
      <MiniCard to="/c/exercises" icon={Dumbbell} label="Biblioteca" />
    </div>
  );
}

function AIPromptCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl bg-surface border border-zinc-800 p-4 flex items-center gap-3 text-left hover:border-zinc-700 transition-colors"
    >
      <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
        <Sparkles size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-50 truncate">¿Cómo te sientes hoy?</p>
        <p className="text-xs text-zinc-500 truncate">
          Registra peso, energía y ánimo de la semana
        </p>
      </div>
      <ArrowRight size={16} className="text-zinc-500 shrink-0" />
    </button>
  );
}
