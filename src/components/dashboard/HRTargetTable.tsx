import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { karvonenBpmAt } from '../../lib/hr-zones';
import type { CardioEval } from '../../hooks/useCardioEvaluation';

interface HRTargetTableProps {
  restingHr: number | null;
  maxHr: number | null;
  evaluation: CardioEval | null;
  onSaved: () => Promise<void>;
}

interface TargetRow {
  pct: 90 | 80 | 70 | 60;
  kmhField: 'target_90_kmh' | 'target_80_kmh' | 'target_70_kmh' | 'target_60_kmh';
  inclineField:
    | 'target_90_incline'
    | 'target_80_incline'
    | 'target_70_incline'
    | 'target_60_incline';
}

const ROWS: TargetRow[] = [
  { pct: 90, kmhField: 'target_90_kmh', inclineField: 'target_90_incline' },
  { pct: 80, kmhField: 'target_80_kmh', inclineField: 'target_80_incline' },
  { pct: 70, kmhField: 'target_70_kmh', inclineField: 'target_70_incline' },
  { pct: 60, kmhField: 'target_60_kmh', inclineField: 'target_60_incline' },
];

type TargetValues = Partial<
  Pick<
    CardioEval,
    | 'target_90_kmh'
    | 'target_90_incline'
    | 'target_80_kmh'
    | 'target_80_incline'
    | 'target_70_kmh'
    | 'target_70_incline'
    | 'target_60_kmh'
    | 'target_60_incline'
  >
>;

export function HRTargetTable({ restingHr, maxHr, evaluation, onSaved }: HRTargetTableProps) {
  const { showError, showSuccess } = useToast();
  const [values, setValues] = useState<TargetValues>({});

  useEffect(() => {
    if (!evaluation) return;
    setValues({
      target_90_kmh: evaluation.target_90_kmh,
      target_90_incline: evaluation.target_90_incline,
      target_80_kmh: evaluation.target_80_kmh,
      target_80_incline: evaluation.target_80_incline,
      target_70_kmh: evaluation.target_70_kmh,
      target_70_incline: evaluation.target_70_incline,
      target_60_kmh: evaluation.target_60_kmh,
      target_60_incline: evaluation.target_60_incline,
    });
  }, [evaluation]);

  async function persist(patch: TargetValues) {
    if (!evaluation) {
      showError('Guarda primero los datos base de FC.');
      return;
    }
    const { error } = await supabase
      .from('cardiovascular_evaluation')
      .update(patch)
      .eq('id', evaluation.id);
    if (error) {
      showError(error.message);
      return;
    }
    showSuccess('Objetivo guardado.');
    await onSaved();
  }

  function handleBlur(field: keyof TargetValues, raw: string) {
    const parsed = raw === '' ? null : Number(raw);
    if (parsed != null && Number.isNaN(parsed)) return;
    persist({ [field]: parsed });
  }

  const canCompute = restingHr != null && maxHr != null && maxHr > restingHr;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase">Objetivos de entrenamiento</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Velocidad e inclinación que el alumno debe usar en la cinta / elíptica en cada zona.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500">
            <th className="px-4 py-2 w-16">% FC</th>
            <th className="px-4 py-2 w-20">LPM</th>
            <th className="px-4 py-2">Velocidad (km/h)</th>
            <th className="px-4 py-2">Inclinación (%)</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const bpm = canCompute ? karvonenBpmAt(restingHr!, maxHr!, row.pct) : null;
            return (
              <tr key={row.pct} className="border-t border-zinc-800">
                <td className="px-4 py-2 font-mono text-zinc-200">{row.pct}%</td>
                <td className="px-4 py-2 font-mono text-zinc-50">{bpm ?? '—'}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    defaultValue={values[row.kmhField] ?? ''}
                    key={`kmh-${row.pct}-${evaluation?.id ?? 'new'}`}
                    onBlur={(e) => handleBlur(row.kmhField, e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-800 bg-base px-2 text-sm text-zinc-50 outline-none focus:border-accent"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    defaultValue={values[row.inclineField] ?? ''}
                    key={`incline-${row.pct}-${evaluation?.id ?? 'new'}`}
                    onBlur={(e) => handleBlur(row.inclineField, e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-800 bg-base px-2 text-sm text-zinc-50 outline-none focus:border-accent"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
