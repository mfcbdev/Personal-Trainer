import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarX, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import type { DashboardAlert, AlertKind } from '../../hooks/useTrainerDashboard';

const ICONS: Record<AlertKind, typeof AlertTriangle> = {
  inactive: AlertTriangle,
  missing_tracking: CalendarX,
  deload: RotateCcw,
};

const TONES: Record<AlertKind, string> = {
  inactive: 'text-amber-400',
  missing_tracking: 'text-sky-400',
  deload: 'text-fuchsia-400',
};

export function AlertsPanel({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-400">No hay alertas. Todo en orden.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <ul className="divide-y divide-zinc-800">
        {alerts.map((alert, i) => {
          const Icon = ICONS[alert.kind];
          return (
            <li key={`${alert.clientId}-${alert.kind}-${i}`}>
              <Link
                to={`/t/clients/${alert.clientId}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60"
              >
                <Icon size={18} className={TONES[alert.kind]} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-50 truncate">{alert.clientName}</p>
                  <p className="text-xs text-zinc-500 truncate">{alert.detail}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
