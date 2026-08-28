import { useMemo, useRef, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useProgressPhotos, type ProgressPhotoWithUrl } from '../../hooks/useProgressPhotos';
import { parseLocalDate } from '../../lib/scheduling';
import type { PhotoPose } from '../../lib/database.types';
import { cn } from '../../utils/cn';

const POSE_LABELS: Record<PhotoPose, string> = {
  frente: 'Frente',
  perfil: 'Perfil',
  espalda: 'Espalda',
};

const POSES: PhotoPose[] = ['frente', 'perfil', 'espalda'];

type Filter = 'all' | PhotoPose;

interface PhotoGalleryProps {
  clientId?: string;
  canEdit?: boolean;
}

export function PhotoGallery({ clientId, canEdit = true }: PhotoGalleryProps) {
  const { photos, loading, uploadPhoto, deletePhoto } = useProgressPhotos(clientId);
  const { showError, showSuccess } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [pose, setPose] = useState<PhotoPose>('frente');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ProgressPhotoWithUrl | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.pose === filter);
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadPhoto(file, pose);
      showSuccess('Foto guardada.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'No se pudo subir la foto.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      {canEdit && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            {POSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPose(p)}
                className={cn(
                  'h-9 px-3 rounded-full text-xs font-medium',
                  pose === p ? 'bg-accent text-zinc-950' : 'bg-surface text-zinc-400',
                )}
              >
                {POSE_LABELS[p]}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Camera size={18} className="mr-2" />
            {uploading ? 'Subiendo...' : `Subir foto de ${POSE_LABELS[pose].toLowerCase()}`}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          Todas
        </FilterChip>
        {POSES.map((p) => (
          <FilterChip key={p} active={filter === p} onClick={() => setFilter(p)}>
            {POSE_LABELS[p]}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 text-center py-6">Cargando fotos...</p>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">
          Aún no hay fotos. Sube tu primera para empezar a comparar.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.date}>
              <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2 capitalize">
                {formatGroupDate(group.date)}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {group.photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setPreview(photo)}
                    className="relative aspect-square rounded-lg bg-zinc-900 overflow-hidden"
                  >
                    {photo.signedUrl ? (
                      <img
                        src={photo.signedUrl}
                        alt={POSE_LABELS[photo.pose]}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600">
                        —
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 text-[10px] px-1.5 rounded bg-black/60 text-zinc-100">
                      {POSE_LABELS[photo.pose]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img src={preview.signedUrl} alt={POSE_LABELS[preview.pose]} className="w-full rounded-lg" />
            <div className="absolute top-2 right-2 flex gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('¿Eliminar esta foto?')) return;
                    try {
                      await deletePhoto(preview);
                      setPreview(null);
                      showSuccess('Foto eliminada.');
                    } catch (err) {
                      showError(err instanceof Error ? err.message : 'No se pudo eliminar la foto.');
                    }
                  }}
                  className="h-9 w-9 rounded-full bg-zinc-900/80 flex items-center justify-center text-red-400"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="h-9 w-9 rounded-full bg-zinc-900/80 flex items-center justify-center text-zinc-100"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-full text-xs font-medium shrink-0',
        active ? 'bg-zinc-800 text-zinc-50' : 'bg-transparent text-zinc-500 border border-zinc-800',
      )}
    >
      {children}
    </button>
  );
}

interface Group {
  date: string;
  photos: ProgressPhotoWithUrl[];
}

function groupByDate(photos: ProgressPhotoWithUrl[]): Group[] {
  const map = new Map<string, ProgressPhotoWithUrl[]>();
  for (const p of photos) {
    const list = map.get(p.taken_at) ?? [];
    list.push(p);
    map.set(p.taken_at, list);
  }
  return Array.from(map.entries())
    .map(([date, list]) => ({ date, photos: list }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function formatGroupDate(isoDate: string): string {
  return format(parseLocalDate(isoDate), "d 'de' MMMM 'de' yyyy", { locale: es });
}
