import { useFormContext } from 'react-hook-form';
import type { OnboardingInput } from '../../../lib/onboarding-schema';

export function Step5Objectives() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingInput>();

  return (
    <div>
      <textarea
        {...register('objectives')}
        rows={8}
        placeholder="¿Qué quieres lograr? Ej. ganar masa muscular, mejorar mi resistencia, bajar de peso, prepararme para una competencia..."
        className="w-full rounded-lg border border-zinc-800 bg-surface px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
      />
      {errors.objectives && <p className="mt-1 text-xs text-red-400">{errors.objectives.message}</p>}
    </div>
  );
}
