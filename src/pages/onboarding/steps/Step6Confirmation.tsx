import { useFormContext } from 'react-hook-form';
import { Card } from '../../../components/ui/Card';
import type { OnboardingInput } from '../../../lib/onboarding-schema';

const YES_NO = { true: 'Sí', false: 'No' } as const;

export function Step6Confirmation() {
  const { watch } = useFormContext<OnboardingInput>();
  const values = watch();

  return (
    <div className="space-y-3">
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Datos personales</h3>
        <p className="text-sm text-zinc-200">{values.fullName}</p>
        <p className="text-sm text-zinc-400">
          {values.nationality} · {values.sex} · {values.birthDate}
        </p>
        <p className="text-sm text-zinc-400">{values.phone}</p>
      </Card>
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Salud</h3>
        <p className="text-sm text-zinc-400">
          Cardíaca: {YES_NO[String(values.cardiacCondition) as 'true' | 'false']} · Patología:{' '}
          {YES_NO[String(values.pathology) as 'true' | 'false']} · Ósea/articular:{' '}
          {YES_NO[String(values.boneJointCondition) as 'true' | 'false']} · Medicación:{' '}
          {YES_NO[String(values.medication) as 'true' | 'false']}
        </p>
      </Card>
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Estilo de vida</h3>
        <p className="text-sm text-zinc-400">
          Fumar: {values.smoking} · Alcohol: {values.alcohol} · Nutrición: {values.nutrition} · Actividad física:{' '}
          {values.physicalActivity}
        </p>
      </Card>
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Hábitos diarios</h3>
        <p className="text-sm text-zinc-400">
          {values.dailySteps} pasos · {values.dailyActiveHours}h activas · Sueño {values.sleepQuality}/10 · Estrés{' '}
          {values.stress}/10
        </p>
      </Card>
      <Card>
        <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Objetivo</h3>
        <p className="text-sm text-zinc-300">{values.objectives}</p>
      </Card>
    </div>
  );
}
