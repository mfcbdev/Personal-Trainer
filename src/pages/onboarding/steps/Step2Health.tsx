import { Controller, useFormContext } from 'react-hook-form';
import type { OnboardingInput } from '../../../lib/onboarding-schema';

interface ToggleQuestionProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  detail: string;
  onDetailChange: (value: string) => void;
  detailPlaceholder: string;
}

function ToggleQuestion({ label, checked, onChange, detail, onDetailChange, detailPlaceholder }: ToggleQuestionProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-200">{label}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`h-9 px-4 rounded-lg text-sm font-medium ${checked ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400'}`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`h-9 px-4 rounded-lg text-sm font-medium ${!checked ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400'}`}
          >
            No
          </button>
        </div>
      </div>
      {checked && (
        <textarea
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder={detailPlaceholder}
          rows={2}
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
        />
      )}
    </div>
  );
}

export function Step2Health() {
  const { control } = useFormContext<OnboardingInput>();

  return (
    <>
      <Controller
        control={control}
        name="cardiacCondition"
        render={({ field: cardiac }) => (
          <Controller
            control={control}
            name="cardiacDetail"
            render={({ field: detail }) => (
              <ToggleQuestion
                label="¿Tienes alguna condición cardíaca?"
                checked={cardiac.value}
                onChange={cardiac.onChange}
                detail={detail.value ?? ''}
                onDetailChange={detail.onChange}
                detailPlaceholder="Describe brevemente tu condición"
              />
            )}
          />
        )}
      />
      <Controller
        control={control}
        name="pathology"
        render={({ field: pathology }) => (
          <Controller
            control={control}
            name="pathologyDetail"
            render={({ field: detail }) => (
              <ToggleQuestion
                label="¿Tienes alguna patología diagnosticada?"
                checked={pathology.value}
                onChange={pathology.onChange}
                detail={detail.value ?? ''}
                onDetailChange={detail.onChange}
                detailPlaceholder="Describe brevemente tu patología"
              />
            )}
          />
        )}
      />
      <Controller
        control={control}
        name="boneJointCondition"
        render={({ field: bone }) => (
          <Controller
            control={control}
            name="boneJointDetail"
            render={({ field: detail }) => (
              <ToggleQuestion
                label="¿Tienes alguna lesión ósea o articular?"
                checked={bone.value}
                onChange={bone.onChange}
                detail={detail.value ?? ''}
                onDetailChange={detail.onChange}
                detailPlaceholder="Describe brevemente la lesión"
              />
            )}
          />
        )}
      />
      <Controller
        control={control}
        name="medication"
        render={({ field: medication }) => (
          <Controller
            control={control}
            name="medicationDetail"
            render={({ field: detail }) => (
              <ToggleQuestion
                label="¿Tomas algún medicamento de forma regular?"
                checked={medication.value}
                onChange={medication.onChange}
                detail={detail.value ?? ''}
                onDetailChange={detail.onChange}
                detailPlaceholder="¿Cuál medicamento?"
              />
            )}
          />
        )}
      />
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">¿Algo más sobre tu salud que debamos saber?</label>
        <Controller
          control={control}
          name="additionalNotes"
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              placeholder="Opcional"
              className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
            />
          )}
        />
      </div>
    </>
  );
}
