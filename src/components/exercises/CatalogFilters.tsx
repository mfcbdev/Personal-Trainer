import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EXERCISE_ZONES, MOVEMENT_TYPES, ZONE_LABELS, MOVEMENT_TYPE_LABELS } from '../../lib/constants';
import type { CatalogFilterState } from '../../hooks/useExercisesCatalog';

interface CatalogFiltersProps {
  value: CatalogFilterState;
  onChange: (value: CatalogFilterState) => void;
  categories: string[];
  equipments: string[];
}

export function CatalogFilters({ value, onChange, categories, equipments }: CatalogFiltersProps) {
  return (
    <div className="space-y-3 mb-5">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Buscar por nombre..."
          className="h-11 w-full rounded-lg border border-zinc-800 bg-surface pl-10 pr-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          className="h-11 rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 outline-none focus:border-accent capitalize"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={value.equipment}
          onChange={(e) => onChange({ ...value, equipment: e.target.value })}
          className="h-11 rounded-lg border border-zinc-800 bg-surface px-3 text-sm text-zinc-50 outline-none focus:border-accent capitalize"
        >
          <option value="all">Todo el equipamiento</option>
          {equipments.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterPill active={value.zone === 'all'} label="Todas las zonas" onClick={() => onChange({ ...value, zone: 'all' })} />
        {EXERCISE_ZONES.map((zone) => (
          <FilterPill
            key={zone}
            active={value.zone === zone}
            label={ZONE_LABELS[zone]}
            onClick={() => onChange({ ...value, zone })}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterPill
          active={value.movementType === 'all'}
          label="Todos los movimientos"
          onClick={() => onChange({ ...value, movementType: 'all' })}
        />
        {MOVEMENT_TYPES.map((type) => (
          <FilterPill
            key={type}
            active={value.movementType === type}
            label={MOVEMENT_TYPE_LABELS[type]}
            onClick={() => onChange({ ...value, movementType: type })}
          />
        ))}
      </div>
    </div>
  );
}

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 px-3.5 whitespace-nowrap rounded-full text-xs font-medium border transition-colors capitalize',
        active ? 'bg-accent text-zinc-950 border-accent' : 'bg-surface text-zinc-400 border-zinc-800',
      )}
    >
      {label}
    </button>
  );
}
