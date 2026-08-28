import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import type { Exercise, ExerciseInsert } from '../../hooks/useExercises';
import { useExerciseVideoUpload } from '../../hooks/useExerciseVideoUpload';
import { MUSCLE_GROUPS, MUSCLE_GROUP_CLASSIFICATION } from '../../lib/constants';
import { exerciseSchema, type ExerciseInput } from '../../lib/exercise-schema';
import { resolveVideoSource } from '../../lib/video-source';

interface ExerciseFormModalProps {
  open: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onSubmit: (payload: Omit<ExerciseInsert, 'trainer_id'>) => Promise<void>;
}

export function ExerciseFormModal({ open, exercise, onClose, onSubmit }: ExerciseFormModalProps) {
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { uploadVideo, deleteVideoByUrl, uploading } = useExerciseVideoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const preview = resolveVideoSource(videoUrl);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    // Remember the URL currently in the form so we can clean it up once the
    // new upload succeeds. Without this, every re-upload leaves the previous
    // file permanently orphaned in the exercise-media bucket.
    const previousUrl = videoUrl;
    try {
      const url = await uploadVideo(file);
      setValue('videoUrl', url, { shouldValidate: true });
      showSuccess('Video subido.');
      // Best-effort cleanup — no-op for YouTube URLs or foreign hosts.
      await deleteVideoByUrl(previousUrl);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'No se pudo subir el video.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

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
          <label className="block text-sm text-zinc-400 mb-1.5">Video de YouTube (URL)</label>
          <Input {...register('videoUrl')} placeholder="https://www.youtube.com/shorts/..." />
          {errors.videoUrl && <p className="mt-1 text-xs text-red-400">{errors.videoUrl.message}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-zinc-500">o bien</span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="md"
            >
              <Upload size={14} className="mr-1.5" />
              {uploading ? 'Subiendo...' : 'Subir archivo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
          </div>

          {preview.kind === 'youtube' && preview.thumbnail && (
            <img src={preview.thumbnail} alt="" className="mt-2 h-24 w-full max-w-xs rounded-lg object-cover" />
          )}
          {preview.kind === 'file' && preview.playerUrl && (
            <video
              src={preview.playerUrl}
              controls
              className="mt-2 h-32 w-full max-w-xs rounded-lg bg-black"
            />
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
