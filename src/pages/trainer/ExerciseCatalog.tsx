import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { CatalogCard } from '../../components/exercises/CatalogCard';
import { CatalogFilters } from '../../components/exercises/CatalogFilters';
import { CatalogDetailModal } from '../../components/exercises/CatalogDetailModal';
import {
  useExercisesCatalog,
  defaultCatalogFilters,
  type CatalogFilterState,
} from '../../hooks/useExercisesCatalog';

const PAGE_SIZE = 60;

export default function ExerciseCatalog() {
  const navigate = useNavigate();
  const { rows, facets, loading, error, importCatalog, importingId } = useExercisesCatalog();
  const [filters, setFilters] = useState<CatalogFilterState>(defaultCatalogFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.zone !== 'all' && r.zone !== filters.zone) return false;
      if (filters.movementType !== 'all' && r.movement_type !== filters.movementType) return false;
      if (filters.category !== 'all' && r.category !== filters.category) return false;
      if (filters.equipment !== 'all' && r.equipment !== filters.equipment) return false;
      if (search && !r.name.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [rows, filters]);

  const paged = filtered.slice(0, visible);

  function updateFilters(next: CatalogFilterState) {
    setFilters(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <div>
      <PageHeader
        title="Catálogo de ejercicios"
        action={
          <Button type="button" variant="secondary" onClick={() => navigate('/t/exercises')}>
            <ArrowLeft size={16} className="mr-1.5" /> Mi biblioteca
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-red-400 mb-4">No se pudo cargar el catálogo: {error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <>
          <CatalogFilters
            value={filters}
            onChange={updateFilters}
            categories={facets.categories}
            equipments={facets.equipments}
          />

          <p className="text-xs text-zinc-500 mb-3">
            {filtered.length.toLocaleString()} de {rows.length.toLocaleString()} ejercicios
          </p>

          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-10">Ningún ejercicio coincide con los filtros.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {paged.map((row) => (
                  <CatalogCard key={row.id} exercise={row} onClick={() => setSelectedId(row.id)} />
                ))}
              </div>

              {visible < filtered.length && (
                <div className="mt-6 flex justify-center">
                  <Button type="button" variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Cargar más
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <CatalogDetailModal
        catalogId={selectedId}
        onClose={() => setSelectedId(null)}
        onImport={importCatalog}
        importing={importingId === selectedId}
      />
    </div>
  );
}
