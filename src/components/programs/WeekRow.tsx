import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SessionCard } from './SessionCard';
import { formatShortDate } from '../../lib/scheduling';
import type { WeekWithSessions, SessionWithCount } from '../../hooks/useProgramBuilder';

interface WeekRowProps {
  week: WeekWithSessions;
  weekStart: Date;
  allWeeks: { id: string; label: string }[];
  onToggleDeload: (isDeload: boolean) => void;
  onAddSession: () => void;
  onSessionClick: (session: SessionWithCount) => void;
  onDuplicateSession: (session: SessionWithCount) => void;
  onDeleteSession: (session: SessionWithCount) => void;
  onDuplicateWeek: (targetWeekId: string) => void;
  onSetSessionDay: (session: SessionWithCount, isoDate: string) => void;
}

export function WeekRow({
  week,
  weekStart,
  allWeeks,
  onToggleDeload,
  onAddSession,
  onSessionClick,
  onDuplicateSession,
  onDeleteSession,
  onDuplicateWeek,
  onSetSessionDay,
}: WeekRowProps) {
  const [duplicateTarget, setDuplicateTarget] = useState('');
  const otherWeeks = allWeeks.filter((w) => w.id !== week.id);

  return (
    <div className={cn('rounded-lg p-4 mb-3', week.is_deload ? 'bg-zinc-900/60' : 'bg-surface')}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-50">Semana {week.week_number}</h3>
          <span className="text-xs text-zinc-500 capitalize">{formatShortDate(weekStart)}</span>
          {week.is_deload && <span className="text-xs text-zinc-500">Deload</span>}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={week.is_deload}
              onChange={(e) => onToggleDeload(e.target.checked)}
              className="accent-accent"
            />
            Deload
          </label>
          {otherWeeks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={duplicateTarget}
                onChange={(e) => setDuplicateTarget(e.target.value)}
                className="h-8 rounded-lg border border-zinc-800 bg-base px-2 text-xs text-zinc-300"
              >
                <option value="">Duplicar a...</option>
                {otherWeeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!duplicateTarget}
                onClick={() => {
                  if (!duplicateTarget) return;
                  onDuplicateWeek(duplicateTarget);
                  setDuplicateTarget('');
                }}
                className="h-8 px-2 rounded-lg bg-zinc-800 text-xs text-zinc-300 disabled:opacity-40"
              >
                Ir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {week.sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            weekStart={weekStart}
            onClick={() => onSessionClick(session)}
            onDuplicate={() => onDuplicateSession(session)}
            onDelete={() => onDeleteSession(session)}
            onSetDay={(isoDate) => onSetSessionDay(session, isoDate)}
          />
        ))}
        {week.sessions.length < 7 && (
          <button
            type="button"
            onClick={onAddSession}
            className="w-36 shrink-0 rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
          >
            <Plus size={18} />
            <span className="text-xs">Sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}
