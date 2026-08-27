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
import { Skeleton } from '../../components/ui/Skeleton';
import { PhasePill } from '../../components/dashboard/PhasePill';
import { useTrainerCalendar, type TrainerCalendarSession } from '../../hooks/useTrainerCalendar';
import { getCurrentWeekStart, toISODate, WEEKDAY_LABELS } from '../../lib/scheduling';
import { cn } from '../../utils/cn';

type ViewMode = 'week' | 'month';

export default function TrainerCalendar() {
  const [mode, setMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [monthAnchor, setMonthAnchor] = useState(new Date());

  const rangeStart = mode === 'week' ? weekStart : startOfMonth(monthAnchor);
  const rangeEnd = mode === 'week' ? addDays(weekStart, 6) : endOfMonth(monthAnchor);

  const { sessions, loading } = useTrainerCalendar(rangeStart, rangeEnd);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainerCalendarSession[]>();
    for (const s of sessions) {
      const list = map.get(s.scheduledDate) ?? [];
      list.push(s);
      map.set(s.scheduledDate, list);
    }
    return map;
  }, [sessions]);

  const selectedIso = toISODate(selectedDate);
  const selectedSessions = sessionsByDate.get(selectedIso) ?? [];

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
        <WeekStrip
          weekStart={weekStart}
          selectedDate={selectedDate}
          sessionsByDate={sessionsByDate}
          onPrev={() => setWeekStart((d) => addDays(d, -7))}
          onNext={() => setWeekStart((d) => addDays(d, 7))}
          onSelect={selectDate}
        />
      ) : (
        <MonthGrid
          anchor={monthAnchor}
          onPrev={() => setMonthAnchor((d) => addMonths(d, -1))}
          onNext={() => setMonthAnchor((d) => addMonths(d, 1))}
          sessionsByDate={sessionsByDate}
          onSelect={selectDate}
        />
      )}

      {loading ? (
        <Skeleton className="h-32" />
      ) : selectedSessions.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-zinc-400">Sin sesiones programadas.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-zinc-500 uppercase capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          {selectedSessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekStrip({
  weekStart,
  selectedDate,
  sessionsByDate,
  onPrev,
  onNext,
  onSelect,
}: {
  weekStart: Date;
  selectedDate: Date;
  sessionsByDate: Map<string, TrainerCalendarSession[]>;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (d: Date) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onPrev} className="h-9 w-9 text-zinc-400">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-zinc-400 capitalize">{format(weekStart, 'MMMM yyyy', { locale: es })}</span>
        <button type="button" onClick={onNext} className="h-9 w-9 text-zinc-400">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {WEEKDAY_LABELS.map((label, i) => {
          const date = addDays(weekStart, i);
          const iso = toISODate(date);
          const count = sessionsByDate.get(iso)?.length ?? 0;
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-2',
                isSelected ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-300',
              )}
            >
              <span className="text-[10px] opacity-70">{label[0]}</span>
              <span className="text-sm font-medium">{format(date, 'd')}</span>
              <span className="text-[10px] font-mono">{count > 0 ? `${count}` : ' '}</span>
            </button>
          );
        })}
      </div>
    </>
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
  sessionsByDate: Map<string, TrainerCalendarSession[]>;
  onSelect: (date: Date) => void;
}) {
  const days = useMemo(() => {
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    const leading = (getDay(start) + 6) % 7; // Monday-first
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
        {Array.from({ length: days.leading }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.days.map((date) => {
          const iso = toISODate(date);
          const count = sessionsByDate.get(iso)?.length ?? 0;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(date)}
              className="flex flex-col items-center gap-1 rounded-lg py-2 bg-surface text-zinc-300"
            >
              <span className="text-sm">{format(date, 'd')}</span>
              <span className="text-[10px] font-mono text-zinc-500">{count > 0 ? `${count}` : ' '}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: TrainerCalendarSession }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/t/clients/${session.clientId}/program/${session.programId}/session/${session.id}`)
      }
      className="w-full text-left rounded-lg bg-surface border border-zinc-800 p-3 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-50 truncate">{session.clientName}</p>
          <p className="text-xs text-zinc-500 truncate">
            {session.name || `Sesión ${session.sessionNumber}`} · Semana {session.weekNumber}
            {session.isDeload ? ' · Deload' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PhasePill phase={session.phaseType} />
          {session.completed && <span className="text-xs text-accent">✓</span>}
        </div>
      </div>
    </button>
  );
}
