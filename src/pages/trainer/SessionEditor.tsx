import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { SessionExerciseRow } from '../../components/programs/SessionExerciseRow';
import { SessionCardioRow } from '../../components/programs/SessionCardioRow';
import { ExercisePickerModal } from '../../components/programs/ExercisePickerModal';
import { useSessionDetail } from '../../hooks/useSessionDetail';
import { useToast } from '../../contexts/ToastContext';

export default function SessionEditor() {
  const { id: clientId, pid: programId, sid: sessionId } = useParams<{ id: string; pid: string; sid: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { session, items, loading, updateSessionMeta, addExercise, addCardioItem, updateItem, removeItem, reorder } =
    useSessionDetail(sessionId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const dragIndex = useRef<number | null>(null);

  if (loading || !session) {
    return (
      <div>
        <PageHeader title="Sesión" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex.current, 1);
    newItems.splice(targetIndex, 0, moved);
    dragIndex.current = null;
    reorder(newItems);
  }

  async function handleSave() {
    try {
      showSuccess('Sesión guardada.');
      navigate(`/t/clients/${clientId}/program/${programId}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar la sesión.');
    }
  }

  return (
    <div>
      <PageHeader title={`Sesión ${session.session_number}`} />

      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Nombre de la sesión</label>
          <Input
            defaultValue={session.name ?? ''}
            onBlur={(e) => updateSessionMeta({ name: e.target.value })}
            placeholder="Ej. Tren superior"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Fecha programada</label>
          <Input
            type="date"
            defaultValue={session.scheduled_date ?? ''}
            onChange={(e) => updateSessionMeta({ scheduled_date: e.target.value || null })}
          />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {items.map((item, index) => {
          const dragProps = {
            draggable: true,
            onDragStart: () => {
              dragIndex.current = index;
            },
            onDragOver: (e: React.DragEvent) => e.preventDefault(),
            onDrop: () => handleDrop(index),
          };
          return item.item_type === 'strength' ? (
            <SessionExerciseRow
              key={item.id}
              item={item}
              onUpdate={(fields) => updateItem(item.id, fields)}
              onRemove={() => removeItem(item.id)}
              dragProps={dragProps}
            />
          ) : (
            <SessionCardioRow
              key={item.id}
              item={item}
              onUpdate={(fields) => updateItem(item.id, fields)}
              onRemove={() => removeItem(item.id)}
              dragProps={dragProps}
            />
          );
        })}
      </div>

      <Button type="button" variant="secondary" className="w-full mb-6" onClick={() => setPickerOpen(true)}>
        <Plus size={18} className="mr-1.5" /> Agregar
      </Button>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(`/t/clients/${clientId}/program/${programId}`)}>
          <ArrowLeft size={18} />
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={handleSave}>
          Guardar sesión
        </Button>
      </div>

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectExercise={addExercise}
        onSelectCardioInformal={(fields) => addCardioItem({ item_type: 'cardio_informal', ...fields })}
        onSelectCardioFormal={(fields) => addCardioItem({ item_type: 'cardio_formal', ...fields })}
      />
    </div>
  );
}
