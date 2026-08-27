import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClipboardList, Dumbbell, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

interface ShortcutProps {
  to: string;
  icon: typeof ClipboardList;
  title: string;
  subtitle: string;
}

function Shortcut({ to, icon: Icon, title, subtitle }: ShortcutProps) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow">
        <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-50">{title}</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </Card>
    </Link>
  );
}

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

type PasswordInput = z.infer<typeof passwordSchema>;

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100 text-right ml-4 truncate">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  async function onPasswordSubmit(values: PasswordInput) {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      reset({ password: '', confirm: '' });
      showSuccess('Contraseña actualizada.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setSubmitting(false);
    }
  }

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })
    : null;

  return (
    <div>
      <PageHeader title="Perfil" />

      <div className="space-y-4">
        <Card className="space-y-2">
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Datos personales</h3>
          <InfoRow label="Nombre" value={profile?.full_name} />
          <InfoRow label="Correo" value={profile?.email} />
          <InfoRow label="Teléfono" value={profile?.phone} />
          <InfoRow label="Nacionalidad" value={profile?.nationality} />
          <InfoRow label="Sexo" value={profile?.sex} />
          <InfoRow label="Fecha de nacimiento" value={profile?.birth_date} />
          <InfoRow label="Fecha de ingreso" value={memberSince} />
        </Card>

        {profile?.objectives && (
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Objetivos</h3>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{profile.objectives}</p>
          </Card>
        )}

        <div className="space-y-3">
          <Shortcut
            to="/c/tracking"
            icon={ClipboardList}
            title="Seguimiento semanal"
            subtitle="Registra tu entrenamiento, nutrición y descanso"
          />
          <Shortcut
            to="/c/exercises"
            icon={Dumbbell}
            title="Ejercicios"
            subtitle="Explora la biblioteca y aprende cada movimiento"
          />
        </div>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Cambiar contraseña</h3>
          <form className="space-y-3" onSubmit={handleSubmit(onPasswordSubmit)} noValidate>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Nueva contraseña</label>
              <Input type="password" autoComplete="new-password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Confirmar contraseña</label>
              <Input type="password" autoComplete="new-password" {...register('confirm')} />
              {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </Card>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => signOut()}
        >
          <LogOut size={18} className="mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
