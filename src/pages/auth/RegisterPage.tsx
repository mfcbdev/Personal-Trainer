import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { registerSchema, type RegisterInput } from '../../lib/auth-schemas';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      await signUp(values.email, values.password, { role: 'trainer', fullName: values.fullName });
      showSuccess('Cuenta creada. Revisa tu correo si se requiere confirmación.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">Crear cuenta</h1>
        <p className="text-sm text-zinc-400 mb-6">Regístrate como entrenador</p>
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
        <p className="mt-4 text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
