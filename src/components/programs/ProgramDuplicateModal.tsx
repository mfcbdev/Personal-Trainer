import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useClients } from '../../hooks/useClients';
import { programDuplicateSchema, type ProgramDuplicateFormInput } from '../../lib/program-schema';
import { getMondayOf, toISODate } from '../../lib/scheduling';
import type { Program, ProgramDuplicateInput } from '../../hooks/usePrograms';

interface ProgramDuplicateModalProps {
  source: Program | null;
  onClose: () => void;
  onDuplicate: (source: Program, input: ProgramDuplicateInput) => Promise<Program>;
  onDuplicated: (program: Program) => void;
}

export function ProgramDuplicateModal({ source, onClose, onDuplicate, onDuplicated }: ProgramDuplicateModalProps) {
  const { showError, showSuccess } = useToast();
  const { clients } = useClients();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramDuplicateFormInput>({ resolver: zodResolver(programDuplicateSchema) });

  useEffect(() => {
    if (!source) return;
    // Programs anchor week 1 on a Monday, so default to next Monday.
    reset({
      name: `${source.name} (copia)`,
      startDate: toISODate(addDays(getMondayOf(new Date()), 7)),
      clientId: source.client_id,
    });
  }, [source, reset]);

  async function onSubmit(values: ProgramDuplicateFormInput) {
    if (!source) return;
    setSubmitting(true);
    try {
      const program = await onDuplicate(source, values);
      showSuccess('Programa duplicado. Revísalo y actívalo cuando esté listo.');
      onDuplicated(program);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo duplicar el programa.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={source !== null} onClose={onClose} title="Duplicar programa">
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-sm text-zinc-400">
          Copia fases, semanas, sesiones, ejercicios y progresión. El nuevo programa queda en borrador.
        </p>
        <div>
          <label htmlFor="dup-name" className="block text-sm text-zinc-400 mb-1.5">Nombre del programa</label>
          <Input id="dup-name" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="dup-client" className="block text-sm text-zinc-400 mb-1.5">Alumno</label>
          <select
            id="dup-client"
            {...register('clientId')}
            className="h-11 w-full rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 outline-none focus:border-accent"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name ?? c.email ?? 'Sin nombre'}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-xs text-red-400">{errors.clientId.message}</p>}
        </div>
        <div>
          <label htmlFor="dup-start" className="block text-sm text-zinc-400 mb-1.5">Fecha de inicio</label>
          <Input id="dup-start" type="date" {...register('startDate')} />
          {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Duplicando...' : 'Duplicar programa'}
        </Button>
      </form>
    </Modal>
  );
}
