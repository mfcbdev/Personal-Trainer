import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { programSchema, type ProgramInput } from '../../lib/program-schema';
import { PROGRAM_TEMPLATE_TYPES, PROGRAM_TEMPLATE_LABELS } from '../../lib/constants';
import type { Program, ProgramCreateInput } from '../../hooks/usePrograms';

interface ProgramCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: ProgramCreateInput) => Promise<Program>;
  onCreated: (program: Program) => void;
}

export function ProgramCreateModal({ open, onClose, onCreate, onCreated }: ProgramCreateModalProps) {
  const { showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: { name: '', startDate: '', templateType: null },
  });

  async function onSubmit(values: ProgramInput) {
    setSubmitting(true);
    try {
      const program = await onCreate({
        name: values.name,
        startDate: values.startDate,
        templateType: values.templateType,
      });
      reset();
      onCreated(program);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo crear el programa.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear programa">
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Nombre del programa</label>
          <Input {...register('name')} placeholder="Ej. Programa de fuerza 2026" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Fecha de inicio</label>
          <Input type="date" {...register('startDate')} />
          {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Tipo de programa</label>
          <select
            {...register('templateType', {
              setValueAs: (v: string) => (v ? v : null),
            })}
            defaultValue=""
            className="h-11 w-full rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 outline-none focus:border-accent"
          >
            <option value="">Sin especificar</option>
            {PROGRAM_TEMPLATE_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROGRAM_TEMPLATE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear programa'}
        </Button>
      </form>
    </Modal>
  );
}
