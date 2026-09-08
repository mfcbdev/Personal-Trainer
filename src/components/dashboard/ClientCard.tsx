import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { AdherenceRing } from './AdherenceRing';
import { PhasePill } from './PhasePill';
import type { ClientDashboardEntry } from '../../hooks/useTrainerDashboard';

function relativeFromIso(iso: string | null): string | null {
  if (!iso) return null;
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

export function ClientCard({ entry }: { entry: ClientDashboardEntry }) {
  const lastActivityLabel = relativeFromIso(entry.lastActivity) ?? 'Sin actividad';
  const lastSeenLabel = relativeFromIso(entry.lastSeenAt);

  return (
    <Link to={`/t/clients/${entry.client.id}`}>
      <Card className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow">
        <div className="h-11 w-11 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 relative">
          <User size={20} className="text-zinc-400" />
          {entry.alertCount > 0 && (
            <span
              aria-label={`${entry.alertCount} alerta${entry.alertCount === 1 ? '' : 's'}`}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-zinc-950 flex items-center justify-center leading-none"
            >
              {entry.alertCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-zinc-50 truncate">{entry.client.full_name ?? 'Sin nombre'}</p>
            <PhasePill phase={entry.activePhase} />
          </div>
          <p className="text-xs text-zinc-500 truncate">
            Últ. sesión: {lastActivityLabel}
            {lastSeenLabel && (
              <>
                <span className="mx-1.5 text-zinc-700">·</span>
                Conectado: {lastSeenLabel}
              </>
            )}
          </p>
          {entry.alertCount > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={12} />
              {entry.alertCount === 1 ? '1 alerta' : `${entry.alertCount} alertas`}
            </p>
          )}
        </div>
        <AdherenceRing pct={entry.adherencePct} />
      </Card>
    </Link>
  );
}
