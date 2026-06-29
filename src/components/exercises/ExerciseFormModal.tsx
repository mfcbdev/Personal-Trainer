import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import type { Exercise, ExerciseInsert } from '../../hooks/useExercises';
import { MUSCLE_GROUPS, MUSCLE_GROUP_CLASSIFICATION } from '../../lib/constants';
import { exerciseSchema, type ExerciseInput } from '../../lib/exercise-schema';
import { getYouTubeThumbnail } from '../../lib/youtube';

interface ExerciseFormModalProps {
  open: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onSubmit: (payload: Omit<ExerciseInsert, 'trainer_id'>) => Promise<void>;
}

export function ExerciseFormModal({ open, exercise, onClose, onSubmit }: ExerciseFormModalProps) {
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', muscleGroup: MUSCLE_GROUPS[0], videoUrl: '', notes: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      exercise
        ? {
            name: exercise.name,
            muscleGroup: exercise.muscle_group as ExerciseInput['muscleGroup'],
            videoUrl: exercise.video_url ?? '',
            notes: exercise.notes ?? '',
          }
        : { name: '', muscleGroup: MUSCLE_GROUPS[0], videoUrl: '', notes: '' },
    );
  }, [open, exercise, reset]);

  const videoUrl = watch('videoUrl');
  const thumbnail = videoUrl ? getYouTubeThumbnail(videoUrl) : null;

  async function handleFormSubmit(values: ExerciseInput) {
    setSubmitting(true);
    try {
      const classification = MUSCLE_GROUP_CLASSIFICATION[values.muscleGroup];
      await onSubmit({
        name: values.name,
        muscle_group: values.muscleGroup,
        zone: classification.zone,
        movement_type: classification.movementType,
        video_url: values.videoUrl || null,
        notes: values.notes || null,
      });
      showSuccess(exercise ? 'Ejercicio actualizado.' : 'Ejercicio creado.');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar el ejercicio.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}>
      <form className="space-y-3" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
          <Input {...register('name')} placeholder="Ej. Press de banca plano con barra libre" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Grupo muscular</label>
          <select
            {...register('muscleGroup')}
            className="h-11 w-full rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 outline-none focus:border-accent"
          >
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.muscleGroup && <p className="mt-1 text-xs text-red-400">{errors.muscleGroup.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">URL de video (YouTube)</label>
          <Input {...register('videoUrl')} placeholder="https://www.youtube.com/shorts/..." />
          {errors.videoUrl && <p className="mt-1 text-xs text-red-400">{errors.videoUrl.message}</p>}
          {thumbnail && (
            <img src={thumbnail} alt="" className="mt-2 h-24 w-full max-w-xs rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Notas</label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Opcional"
            className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Modal>
  );
}
