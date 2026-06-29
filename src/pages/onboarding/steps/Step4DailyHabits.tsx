import { Controller, useFormContext } from 'react-hook-form';
import { NumberStepper } from '../../../components/onboarding/NumberStepper';
import { SliderInput } from '../../../components/onboarding/SliderInput';
import type { OnboardingInput } from '../../../lib/onboarding-schema';

export function Step4DailyHabits() {
  const { control } = useFormContext<OnboardingInput>();

  return (
    <>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Pasos diarios promedio</label>
        <Controller
          control={control}
          name="dailySteps"
          render={({ field }) => (
            <NumberStepper value={field.value} onChange={field.onChange} step={500} max={50000} />
          )}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Horas activas al día</label>
        <Controller
          control={control}
          name="dailyActiveHours"
          render={({ field }) => (
            <NumberStepper value={field.value} onChange={field.onChange} step={0.5} max={24} suffix="h" />
          )}
        />
      </div>
      <Controller
        control={control}
        name="sleepQuality"
        render={({ field }) => (
          <SliderInput label="Calidad del sueño" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="stress"
        render={({ field }) => (
          <SliderInput label="Nivel de estrés" value={field.value} onChange={field.onChange} />
        )}
      />
    </>
  );
}
