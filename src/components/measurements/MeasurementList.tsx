import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '../ui/Card';
import { parseLocalDate } from '../../lib/scheduling';
import type { BodyMeasurement } from '../../hooks/useMeasurements';

interface MeasurementListProps {
  measurements: BodyMeasurement[];
  onDelete?: (id: string) => void;
}

interface DeltaCell {
  text: string;
  tone: 'text-zinc-500' | 'text-red-400' | 'text-accent';
}

function formatDelta(current: number | null, prior: number | null): DeltaCell | null {
  if (current == null || prior == null) return null;
  const delta = current - prior;
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return { text: '±0', tone: 'text-zinc-500' };
  return {
    text: `${rounded > 0 ? '+' : ''}${rounded}`,
    tone: rounded > 0 ? 'text-red-400' : 'text-accent',
  };
}

function monthKey(isoDate: string) {
  return format(parseLocalDate(isoDate), 'yyyy-MM');
}

function monthLabel(isoDate: string) {
  return format(parseLocalDate(isoDate), "MMMM 'de' yyyy", { locale: es });
}

export function MeasurementList({ measurements, onDelete }: MeasurementListProps) {
  if (measurements.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-10">Aún no hay mediciones para este cliente.</p>;
  }

  const baseline = measurements[0];

  // Precompute each measurement's previous entry (chronologically) so the
  // card can show a "vs mes anterior" delta alongside the "vs inicial" one.
  const priorById = new Map<string, BodyMeasurement | null>();
  measurements.forEach((m, i) => {
    priorById.set(m.id, i > 0 ? measurements[i - 1] : null);
  });

  // Group by month, newest month first, cards within each month also newest first.
  const groups = new Map<string, BodyMeasurement[]>();
  for (const m of [...measurements].reverse()) {
    const key = monthKey(m.measured_at);
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  return (
    <div className="space-y-5">
      {Array.from(groups.entries()).map(([key, group]) => (
        <div key={key}>
          <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2 capitalize">
            {monthLabel(group[0].measured_at)}
          </h4>
          <div className="space-y-3">
            {group.map((m) => {
              const isBaseline = m.id === baseline.id;
              const prior = priorById.get(m.id) ?? null;
              const priorLabel = prior
                ? format(parseLocalDate(prior.measured_at), "d 'de' MMM", { locale: es })
                : null;

              const weightBaseDelta = isBaseline ? null : formatDelta(m.weight, baseline.weight);
              const fatBaseDelta = isBaseline ? null : formatDelta(m.body_fat_pct, baseline.body_fat_pct);
              const leanBaseDelta = isBaseline ? null : formatDelta(m.lean_mass, baseline.lean_mass);

              const weightPriorDelta = prior ? formatDelta(m.weight, prior.weight) : null;
              const fatPriorDelta = prior ? formatDelta(m.body_fat_pct, prior.body_fat_pct) : null;
              const leanPriorDelta = prior ? formatDelta(m.lean_mass, prior.lean_mass) : null;

              const hasCircumferences =
                m.waist != null || m.hip != null || m.thigh != null || m.biceps_circumference != null;

              const waistBaseDelta = isBaseline ? null : formatDelta(m.waist, baseline.waist);
              const hipBaseDelta = isBaseline ? null : formatDelta(m.hip, baseline.hip);
              const thighBaseDelta = isBaseline ? null : formatDelta(m.thigh, baseline.thigh);
              const bicepsBaseDelta = isBaseline
                ? null
                : formatDelta(m.biceps_circumference, baseline.biceps_circumference);

              const waistPriorDelta = prior ? formatDelta(m.waist, prior.waist) : null;
              const hipPriorDelta = prior ? formatDelta(m.hip, prior.hip) : null;
              const thighPriorDelta = prior ? formatDelta(m.thigh, prior.thigh) : null;
              const bicepsPriorDelta = prior
                ? formatDelta(m.biceps_circumference, prior.biceps_circumference)
                : null;

              return (
                <Card key={m.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-50">{m.measured_at}</p>
                      {isBaseline ? (
                        <p className="text-xs text-zinc-500">Medición inicial</p>
                      ) : (
                        priorLabel && (
                          <p className="text-xs text-zinc-500">Anterior: {priorLabel}</p>
                        )
                      )}
                    </div>
                    {onDelete && (
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
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <MetricCell label="Peso" value={m.weight} suffix="kg" priorDelta={weightPriorDelta} baseDelta={weightBaseDelta} />
                    <MetricCell label="% Grasa" value={m.body_fat_pct} suffix="%" priorDelta={fatPriorDelta} baseDelta={fatBaseDelta} />
                    <MetricCell label="M. magra" value={m.lean_mass} suffix="kg" priorDelta={leanPriorDelta} baseDelta={leanBaseDelta} />
                    <MetricCell label="IMC" value={m.bmi} />
                  </div>
                  {hasCircumferences && (
                    <div className="grid grid-cols-4 gap-2 text-sm mt-3 pt-3 border-t border-zinc-800">
                      <MetricCell label="Cintura" value={m.waist} suffix="cm" priorDelta={waistPriorDelta} baseDelta={waistBaseDelta} />
                      <MetricCell label="Cadera" value={m.hip} suffix="cm" priorDelta={hipPriorDelta} baseDelta={hipBaseDelta} />
                      <MetricCell label="Muslo" value={m.thigh} suffix="cm" priorDelta={thighPriorDelta} baseDelta={thighBaseDelta} />
                      <MetricCell label="Bíceps" value={m.biceps_circumference} suffix="cm" priorDelta={bicepsPriorDelta} baseDelta={bicepsBaseDelta} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricCell({
  label,
  value,
  suffix,
  priorDelta,
  baseDelta,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  priorDelta?: DeltaCell | null;
  baseDelta?: DeltaCell | null;
}) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase mb-0.5">{label}</p>
      <p className="text-zinc-50 font-mono">
        {value ?? '—'}
        {value != null && suffix ? ` ${suffix}` : ''}
      </p>
      {priorDelta && (
        <p className={`text-[10px] font-mono ${priorDelta.tone}`}>
          {priorDelta.text} <span className="text-zinc-600">vs ant.</span>
        </p>
      )}
      {baseDelta && (
        <p className={`text-[10px] font-mono ${baseDelta.tone}`}>
          {baseDelta.text} <span className="text-zinc-600">vs inicial</span>
        </p>
      )}
    </div>
  );
}
