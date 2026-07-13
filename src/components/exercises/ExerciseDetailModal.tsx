import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getYouTubeEmbedUrl } from '../../lib/youtube';
import { ZONE_LABELS, MOVEMENT_TYPE_LABELS } from '../../lib/constants';
import type { Exercise } from '../../hooks/useExercises';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => Promise<void>;
}

export function ExerciseDetailModal({ exercise, onClose, onEdit, onDelete }: ExerciseDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  if (!exercise) return null;

  const current = exercise;
  const embedUrl = current.video_url ? getYouTubeEmbedUrl(current.video_url) : null;

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm(`¿Eliminar "${current.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(current);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const showActions = onEdit || onDelete;

  return (
    <Modal open onClose={onClose} title={exercise.name}>
      {embedUrl && (
        <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-zinc-800">
          <iframe
            src={embedUrl}
            title={exercise.name}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Badge variant="accent">{exercise.muscle_group}</Badge>
        <Badge>{ZONE_LABELS[exercise.zone]}</Badge>
        <Badge>{MOVEMENT_TYPE_LABELS[exercise.movement_type]}</Badge>
      </div>

      {exercise.notes && <p className="text-sm text-zinc-400 mb-4 whitespace-pre-wrap">{exercise.notes}</p>}

      {showActions && (
        <div className="flex gap-2">
          {onEdit && (
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onEdit(exercise)}>
              <Pencil size={16} className="mr-2" /> Editar
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="secondary" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} className="text-red-400" />
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
