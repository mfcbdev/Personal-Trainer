import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User } from 'lucide-react';
import { Card } from '../ui/Card';
import { AdherenceRing } from './AdherenceRing';
import { PhasePill } from './PhasePill';
import type { ClientDashboardEntry } from '../../hooks/useTrainerDashboard';

export function ClientCard({ entry }: { entry: ClientDashboardEntry }) {
  const lastActivityLabel = entry.lastActivity
    ? formatDistanceToNow(new Date(entry.lastActivity), { addSuffix: true, locale: es })
    : 'Sin actividad';

  return (
    <Link to={`/t/clients/${entry.client.id}`}>
      <Card className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow">
        <div className="h-11 w-11 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
          <User size={20} className="text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-zinc-50 truncate">{entry.client.full_name ?? 'Sin nombre'}</p>
            <PhasePill phase={entry.activePhase} />
          </div>
          <p className="text-xs text-zinc-500 truncate">{lastActivityLabel}</p>
        </div>
        <AdherenceRing pct={entry.adherencePct} />
      </Card>
    </Link>
  );
}
