import { useState } from 'react';
import { Check, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useCatalogExercise } from '../../hooks/useCatalogExercise';
import { useToast } from '../../contexts/ToastContext';
import { ZONE_LABELS, MOVEMENT_TYPE_LABELS } from '../../lib/constants';

interface CatalogDetailModalProps {
  catalogId: string | null;
  onClose: () => void;
  onImport: (catalogId: string) => Promise<string>;
  importing: boolean;
}

export function CatalogDetailModal({ catalogId, onClose, onImport, importing }: CatalogDetailModalProps) {
  const { data, loading } = useCatalogExercise(catalogId);
  const { showError, showSuccess } = useToast();
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  if (!catalogId) return null;

  const alreadyImported = importedIds.has(catalogId);

  async function handleImport() {
    if (!catalogId) return;
    try {
      await onImport(catalogId);
      setImportedIds((prev) => new Set(prev).add(catalogId));
      showSuccess('Ejercicio agregado a tu biblioteca.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo importar.');
    }
  }

  return (
    <Modal open onClose={onClose} title={data?.name ?? 'Ejercicio'}>
      {loading || !data ? (
        <div className="space-y-3">
          <Skeleton className="aspect-video" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <>
          {data.gif_url && (
            <div className="aspect-square sm:aspect-video mb-4 rounded-lg overflow-hidden bg-zinc-800">
              <img src={data.gif_url} alt={data.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge variant="accent">{data.target}</Badge>
            <Badge>{data.equipment}</Badge>
            <Badge>{data.category}</Badge>
            <Badge>{ZONE_LABELS[data.zone]}</Badge>
            <Badge>{MOVEMENT_TYPE_LABELS[data.movement_type]}</Badge>
          </div>

          {data.secondary_muscles && data.secondary_muscles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase mb-1.5">Músculos secundarios</h3>
              <p className="text-sm text-zinc-300 capitalize">{data.secondary_muscles.join(', ')}</p>
            </div>
          )}

          {(data.instructions_es || data.instructions_en) && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase mb-1.5">Instrucciones</h3>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {data.instructions_es || data.instructions_en}
              </p>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleImport}
            disabled={importing || alreadyImported}
          >
            {alreadyImported ? (
              <>
                <Check size={16} className="mr-2" /> Importado
              </>
            ) : importing ? (
              'Importando...'
            ) : (
              <>
                <Download size={16} className="mr-2" /> Importar a mi biblioteca
              </>
            )}
          </Button>
        </>
      )}
    </Modal>
  );
}
