import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { measurementSchema, type MeasurementInput } from '../../lib/measurement-schema';
import type { ClientProfile } from '../../hooks/useClients';
import type { BodyMeasurementInsert } from '../../hooks/useMeasurements';
import {
  calcBodyFatPct,
  calcBMI,
  calcFatMass,
  calcLeanMass,
  ageFromBirthDate,
  normalizeSex,
} from '../../lib/body-composition';

interface MeasurementFormModalProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile;
  onSubmit: (payload: Omit<BodyMeasurementInsert, 'client_id'>) => Promise<void>;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function MeasurementFormModal({ open, onClose, client, onSubmit }: MeasurementFormModalProps) {
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MeasurementInput>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measuredAt: todayISO(),
      weight: 0,
      height: 0,
      bicipital: 0,
      tricipital: 0,
      subscapular: 0,
      suprailiac: 0,
    },
  });

  useEffect(() => {
    if (open) reset({ measuredAt: todayISO(), weight: 0, height: 0, bicipital: 0, tricipital: 0, subscapular: 0, suprailiac: 0 });
  }, [open, reset]);

  const values = watch();
  const sex = normalizeSex(client.sex);
  const age = ageFromBirthDate(client.birth_date);

  const derived = useMemo(() => {
    const folds =
      (values.bicipital || 0) + (values.tricipital || 0) + (values.subscapular || 0) + (values.suprailiac || 0);
    const bodyFatPct = sex && age ? calcBodyFatPct(folds, sex, age) : null;
    const fatMass = calcFatMass(values.weight, bodyFatPct);
    const leanMass = calcLeanMass(values.weight, fatMass);
    const bmi = calcBMI(values.weight, values.height);
    return { bodyFatPct, fatMass, leanMass, bmi };
  }, [values.bicipital, values.tricipital, values.subscapular, values.suprailiac, values.weight, values.height, sex, age]);

  async function handleFormSubmit(input: MeasurementInput) {
    setSubmitting(true);
    try {
      await onSubmit({
        measured_at: input.measuredAt,
        weight: input.weight,
        height: input.height,
        bicipital: input.bicipital,
        tricipital: input.tricipital,
        subscapular: input.subscapular,
        suprailiac: input.suprailiac,
        body_fat_pct: derived.bodyFatPct,
        fat_mass: derived.fatMass,
        lean_mass: derived.leanMass,
        bmi: derived.bmi,
      });
      showSuccess('Medición guardada.');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar la medición.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva medición">
      <form className="space-y-3" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Fecha</label>
          <Input type="date" {...register('measuredAt')} />
          {errors.measuredAt && <p className="mt-1 text-xs text-red-400">{errors.measuredAt.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumericField label="Peso (kg)" step="0.1" {...register('weight', { valueAsNumber: true })} error={errors.weight?.message} />
          <NumericField label="Altura (cm)" step="0.1" {...register('height', { valueAsNumber: true })} error={errors.height?.message} />
        </div>

        <h3 className="text-xs font-medium text-zinc-500 uppercase pt-2">Pliegues cutáneos (mm)</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumericField label="Bicipital" step="0.1" {...register('bicipital', { valueAsNumber: true })} />
          <NumericField label="Tricipital" step="0.1" {...register('tricipital', { valueAsNumber: true })} />
          <NumericField label="Subescapular" step="0.1" {...register('subscapular', { valueAsNumber: true })} />
          <NumericField label="Suprailíaco" step="0.1" {...register('suprailiac', { valueAsNumber: true })} />
        </div>

        <div className="rounded-lg bg-base p-4 mt-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Cálculos automáticos</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-zinc-400">Grasa corporal</span>
            <span className="text-zinc-50 text-right font-mono">{fmt(derived.bodyFatPct, '%')}</span>
            <span className="text-zinc-400">Masa grasa</span>
            <span className="text-zinc-50 text-right font-mono">{fmt(derived.fatMass, 'kg')}</span>
            <span className="text-zinc-400">Masa magra</span>
            <span className="text-zinc-50 text-right font-mono">{fmt(derived.leanMass, 'kg')}</span>
            <span className="text-zinc-400">IMC</span>
            <span className="text-zinc-50 text-right font-mono">{fmt(derived.bmi)}</span>
          </div>
          {(!sex || !age) && (
            <p className="mt-3 text-xs text-zinc-500">
              Se requiere sexo y fecha de nacimiento del cliente para calcular grasa corporal.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar medición'}
        </Button>
      </form>
    </Modal>
  );
}

function fmt(value: number | null, suffix = '') {
  if (value == null) return '—';
  return `${value}${suffix ? ` ${suffix}` : ''}`;
}

type NumericFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

function NumericField({ label, error, ...props }: NumericFieldProps) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
      <Input type="number" inputMode="decimal" {...props} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
