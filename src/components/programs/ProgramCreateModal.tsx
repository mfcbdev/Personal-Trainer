import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { programSchema, type ProgramInput } from '../../lib/program-schema';
import type { Program } from '../../hooks/usePrograms';

interface ProgramCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, startDate: string) => Promise<Program>;
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
  } = useForm<ProgramInput>({ resolver: zodResolver(programSchema) });

  async function onSubmit(values: ProgramInput) {
    setSubmitting(true);
    try {
      const program = await onCreate(values.name, values.startDate);
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
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear programa'}
        </Button>
      </form>
    </Modal>
  );
}
