import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { PillSelect } from '../../../components/onboarding/PillSelect';
import type { OnboardingInput } from '../../../lib/onboarding-schema';
import { useAuth } from '../../../contexts/AuthContext';

const SEX_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
];

export function Step1PersonalInfo() {
  const { user } = useAuth();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OnboardingInput>();

  return (
    <>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Correo electrónico</label>
        <Input value={user?.email ?? ''} disabled />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Nombre completo</label>
        <Input {...register('fullName')} placeholder="Tu nombre completo" />
        {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Nacionalidad</label>
        <Input {...register('nationality')} placeholder="Ej. Colombiana" />
        {errors.nationality && <p className="mt-1 text-xs text-red-400">{errors.nationality.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Sexo</label>
        <Controller
          control={control}
          name="sex"
          render={({ field }) => (
            <PillSelect options={SEX_OPTIONS} value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.sex && <p className="mt-1 text-xs text-red-400">{errors.sex.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Fecha de nacimiento</label>
        <Input type="date" {...register('birthDate')} />
        {errors.birthDate && <p className="mt-1 text-xs text-red-400">{errors.birthDate.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1.5">Teléfono</label>
        <Input type="tel" {...register('phone')} placeholder="Tu número de contacto" />
        {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
      </div>
    </>
  );
}
