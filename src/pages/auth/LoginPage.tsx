import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { loginSchema, type LoginInput } from '../../lib/auth-schemas';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">GROW</h1>
        <p className="text-sm text-zinc-400 mb-6">Inicia sesión en tu cuenta</p>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-400">
          ¿Eres entrenador y no tienes cuenta?{' '}
          <Link to="/register" className="text-accent">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
