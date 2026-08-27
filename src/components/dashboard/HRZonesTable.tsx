import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { calculateKarvonenZones, estimatedMaxHr } from '../../lib/hr-zones';
import { ageFromBirthDate } from '../../lib/body-composition';
import type { ClientProfile } from '../../hooks/useClients';
import type { CardioEval } from '../../hooks/useCardioEvaluation';

interface HRZonesTableProps {
  client: ClientProfile;
  evaluation: CardioEval | null;
  onSaved: () => Promise<void>;
}

export function HRZonesTable({ client, evaluation, onSaved }: HRZonesTableProps) {
  const { showError, showSuccess } = useToast();
  const [restingHr, setRestingHr] = useState<string>(String(evaluation?.resting_hr ?? ''));
  const [maxHr, setMaxHr] = useState<string>(String(evaluation?.max_hr ?? ''));
  const [saving, setSaving] = useState(false);

  const age = ageFromBirthDate(client.birth_date) ?? evaluation?.age ?? null;
  const restingValue = Number(restingHr);
  const maxValue = Number(maxHr) || (age ? estimatedMaxHr(age) : 0);
  const zones = restingValue > 0 && maxValue > restingValue ? calculateKarvonenZones(restingValue, maxValue) : [];

  async function save() {
    if (!restingValue || !maxValue || maxValue <= restingValue) {
      showError('Ingresa un pulso en reposo y máximo válidos.');
      return;
    }
    setSaving(true);
    try {
      // Update the latest evaluation row in place so per-target
      // velocidad / inclinación persisted alongside it don't get orphaned.
      // Insert a new row only when the client has no evaluation yet.
      if (evaluation) {
        const { error } = await supabase
          .from('cardiovascular_evaluation')
          .update({ resting_hr: restingValue, max_hr: maxValue, age })
          .eq('id', evaluation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cardiovascular_evaluation').insert({
          client_id: client.id,
          resting_hr: restingValue,
          max_hr: maxValue,
          age,
        });
        if (error) throw error;
      }
      showSuccess('Zonas actualizadas.');
      await onSaved();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Datos base</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">FC reposo (bpm)</label>
            <Input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">FC máxima (bpm)</label>
            <Input type="number" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} placeholder={age ? `${estimatedMaxHr(age)} (estimada)` : ''} />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Si no ingresas FC máxima, se usa la estimación 220 − edad. Fórmula Karvonen para calcular zonas.
        </p>
        <Button type="button" className="mt-4" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar y recalcular'}
        </Button>
      </Card>

      {zones.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="px-4 py-2">Zona</th>
                <th className="px-4 py-2">% FC</th>
                <th className="px-4 py-2">BPM</th>
                <th className="px-4 py-2">Efecto</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.name} className="border-t border-zinc-800">
                  <td className="px-4 py-2 text-zinc-200">{z.name}</td>
                  <td className="px-4 py-2 font-mono text-zinc-400">{z.pctMin}–{z.pctMax}%</td>
                  <td className="px-4 py-2 font-mono text-zinc-50">{z.bpmMin}–{z.bpmMax}</td>
                  <td className="px-4 py-2 text-zinc-400">{z.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
