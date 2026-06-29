import { Controller, useFormContext } from 'react-hook-form';
import { FrequencySelect } from '../../../components/onboarding/FrequencySelect';
import type { OnboardingInput } from '../../../lib/onboarding-schema';

export function Step3Lifestyle() {
  const { control, watch } = useFormContext<OnboardingInput>();
  const otherActivities = watch('otherActivities');

  return (
    <>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">¿Fumas?</label>
        <Controller
          control={control}
          name="smoking"
          render={({ field }) => <FrequencySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">¿Consumes alcohol?</label>
        <Controller
          control={control}
          name="alcohol"
          render={({ field }) => <FrequencySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">¿Sigues una alimentación balanceada?</label>
        <Controller
          control={control}
          name="nutrition"
          render={({ field }) => <FrequencySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-2">¿Realizas actividad física?</label>
        <Controller
          control={control}
          name="physicalActivity"
          render={({ field }) => <FrequencySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-zinc-200">¿Practicas otras actividades?</label>
          <Controller
            control={control}
            name="otherActivities"
            render={({ field }) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={`h-9 px-4 rounded-lg text-sm font-medium ${field.value ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400'}`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={`h-9 px-4 rounded-lg text-sm font-medium ${!field.value ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400'}`}
                >
                  No
                </button>
              </div>
            )}
          />
        </div>
        {otherActivities && (
          <Controller
            control={control}
            name="otherActivitiesDetail"
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                placeholder="¿Cuáles?"
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
              />
            )}
          />
        )}
      </div>
    </>
  );
}
