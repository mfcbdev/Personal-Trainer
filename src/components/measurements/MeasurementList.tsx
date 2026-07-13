import { Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import type { BodyMeasurement } from '../../hooks/useMeasurements';

interface MeasurementListProps {
  measurements: BodyMeasurement[];
  onDelete: (id: string) => void;
}

function formatDelta(current: number | null, baseline: number | null) {
  if (current == null || baseline == null) return null;
  const delta = current - baseline;
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return { text: '±0', tone: 'text-zinc-500' as const };
  return {
    text: `${rounded > 0 ? '+' : ''}${rounded}`,
    tone: rounded > 0 ? ('text-red-400' as const) : ('text-accent' as const),
  };
}

export function MeasurementList({ measurements, onDelete }: MeasurementListProps) {
  if (measurements.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-10">Aún no hay mediciones para este cliente.</p>;
  }

  const baseline = measurements[0];

  return (
    <div className="space-y-3">
      {[...measurements].reverse().map((m) => {
        const isBaseline = m.id === baseline.id;
        const weightDelta = isBaseline ? null : formatDelta(m.weight, baseline.weight);
        const fatDelta = isBaseline ? null : formatDelta(m.body_fat_pct, baseline.body_fat_pct);
        const leanDelta = isBaseline ? null : formatDelta(m.lean_mass, baseline.lean_mass);

        return (
          <Card key={m.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-zinc-50">{m.measured_at}</p>
                {isBaseline && <p className="text-xs text-zinc-500">Medición inicial</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Eliminar esta medición?')) onDelete(m.id);
                }}
                className="text-zinc-500 hover:text-red-400"
                aria-label="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <MetricCell label="Peso" value={m.weight} suffix="kg" delta={weightDelta} />
              <MetricCell label="% Grasa" value={m.body_fat_pct} suffix="%" delta={fatDelta} />
              <MetricCell label="M. magra" value={m.lean_mass} suffix="kg" delta={leanDelta} />
              <MetricCell label="IMC" value={m.bmi} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MetricCell({
  label,
  value,
  suffix,
  delta,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  delta?: { text: string; tone: string } | null;
}) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase mb-0.5">{label}</p>
      <p className="text-zinc-50 font-mono">
        {value ?? '—'}
        {value != null && suffix ? ` ${suffix}` : ''}
      </p>
      {delta && <p className={`text-[10px] font-mono ${delta.tone}`}>{delta.text}</p>}
    </div>
  );
}
