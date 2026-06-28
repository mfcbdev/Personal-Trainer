import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const inviteFormSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type InviteFormInput = z.infer<typeof inviteFormSchema>;

// The invite token is the inviting trainer's profile id. RLS prevents an
// anonymous visitor from reading the trainer's profile to validate it
// up front, so we trust the token here and let the foreign key on
// profiles.trainer_id reject sign-up if it's not a real trainer.
export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { signUp } = useAuth();
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormInput>({ resolver: zodResolver(inviteFormSchema) });

  async function onSubmit(values: InviteFormInput) {
    if (!token) return;
    setSubmitting(true);
    try {
      await signUp(values.email, values.password, {
        role: 'client',
        fullName: values.fullName,
        trainerId: token,
      });
      showSuccess('Cuenta creada. Revisa tu correo si se requiere confirmación.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-full items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <p className="text-sm text-zinc-400">Enlace de invitación inválido.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-xl font-semibold mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-zinc-400 mb-6">Has sido invitado por tu entrenador.</p>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Input type="text" placeholder="Nombre completo" autoComplete="name" {...register('fullName')} />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
          </div>
          <div>
            <Input type="email" placeholder="Correo electrónico" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
