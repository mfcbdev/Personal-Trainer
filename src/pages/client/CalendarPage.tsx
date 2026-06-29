import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useActiveProgram } from '../../hooks/useActiveProgram';
import { useSessionDetail } from '../../hooks/useSessionDetail';
import { flattenSessions } from '../../lib/program-utils';
import { getCurrentWeekStart, toISODate, WEEKDAY_LABELS } from '../../lib/scheduling';
import { cn } from '../../utils/cn';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { data, loading, hasActiveProgram } = useActiveProgram();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [monthAnchor, setMonthAnchor] = useState(new Date());

  if (loading) {
    return (
      <div>
        <PageHeader title="Calendario" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!hasActiveProgram || !data) {
    return (
      <div>
        <PageHeader title="Calendario" />
        <Card className="text-center">
          <p className="text-sm text-zinc-400">Aún no tienes un programa activo.</p>
        </Card>
      </div>
    );
  }

  const flat = flattenSessions(data);
  const sessionsByDate = new Map(flat.filter((f) => f.session.scheduled_date).map((f) => [f.session.scheduled_date!, f]));
  const selectedEntry = sessionsByDate.get(toISODate(selectedDate));

  function selectDate(date: Date) {
    setSelectedDate(date);
    setMode('week');
  }

  return (
    <div>
      <PageHeader
        title="Calendario"
        action={
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'week' ? 'month' : 'week'))}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface text-zinc-400"
            aria-label="Cambiar vista"
          >
            {mode === 'week' ? <CalendarIcon size={18} /> : <List size={18} />}
          </button>
        }
      />

      {mode === 'week' ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setWeekStart((d) => addDays(d, -7))} className="h-9 w-9 text-zinc-400">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-zinc-400 capitalize">{format(weekStart, "MMMM yyyy", { locale: es })}</span>
            <button type="button" onClick={() => setWeekStart((d) => addDays(d, 7))} className="h-9 w-9 text-zinc-400">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {WEEKDAY_LABELS.map((label, i) => {
              const date = addDays(weekStart, i);
              const iso = toISODate(date);
              const entry = sessionsByDate.get(iso);
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg py-2',
                    isSelected ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-300',
                  )}
                >
                  <span className="text-[10px] opacity-70">{label[0]}</span>
                  <span className="text-sm font-medium">{format(date, 'd')}</span>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      entry ? (entry.session.completed ? 'bg-current' : 'border border-current') : 'bg-transparent',
                    )}
                  />
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <MonthGrid
          anchor={monthAnchor}
          onPrev={() => setMonthAnchor((d) => addMonths(d, -1))}
          onNext={() => setMonthAnchor((d) => addMonths(d, 1))}
          sessionsByDate={sessionsByDate}
          onSelect={selectDate}
        />
      )}

      {selectedEntry ? (
        <SelectedSessionCard
          sessionId={selectedEntry.session.id}
          onView={() => navigate(`/c/session/${selectedEntry.session.id}`)}
        />
      ) : (
        <Card className="text-center">
          <p className="text-sm text-zinc-400">Día de descanso.</p>
        </Card>
      )}
    </div>
  );
}

function MonthGrid({
  anchor,
  onPrev,
  onNext,
  sessionsByDate,
  onSelect,
}: {
  anchor: Date;
  onPrev: () => void;
  onNext: () => void;
  sessionsByDate: Map<string, ReturnType<typeof flattenSessions>[number]>;
  onSelect: (date: Date) => void;
}) {
  const days = useMemo(() => {
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    const leading = (getDay(start) + 6) % 7; // Monday-first offset
    return { start, days: eachDayOfInterval({ start, end }), leading };
  }, [anchor]);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onPrev} className="h-9 w-9 text-zinc-400">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-zinc-400 capitalize">{format(anchor, 'MMMM yyyy', { locale: es })}</span>
        <button type="button" onClick={onNext} className="h-9 w-9 text-zinc-400">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[10px] text-zinc-500">
            {label[0]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: days.leading }).map((_, i) => <div key={`b-${i}`} />)}
        {days.days.map((date) => {
          const iso = toISODate(date);
          const entry = sessionsByDate.get(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(date)}
              className="flex flex-col items-center gap-1 rounded-lg py-2 bg-surface text-zinc-300"
            >
              <span className="text-sm">{format(date, 'd')}</span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  entry ? (entry.session.completed ? 'bg-accent' : 'border border-zinc-400') : 'bg-transparent',
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedSessionCard({ sessionId, onView }: { sessionId: string; onView: () => void }) {
  const { session, items, loading } = useSessionDetail(sessionId);

  if (loading || !session) return <Skeleton className="h-24" />;

  return (
    <Card>
      <p className="text-sm font-medium text-zinc-50 mb-1">{session.name || `Sesión ${session.session_number}`}</p>
      <p className="text-sm text-zinc-500 mb-4">{items.length} ejercicios</p>
      <Button type="button" className="w-full" onClick={onView}>
        Ver sesión
      </Button>
    </Card>
  );
}
