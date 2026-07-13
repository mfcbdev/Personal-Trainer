import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { WeightChart } from '../../components/progress/WeightChart';
import { BodyCompositionChart } from '../../components/progress/BodyCompositionChart';
import { VolumeChart } from '../../components/progress/VolumeChart';
import { MuscleHeatmap } from '../../components/progress/MuscleHeatmap';
import { MeasurementList } from '../../components/measurements/MeasurementList';
import { useClientProgress } from '../../hooks/useClientProgress';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useAuth } from '../../contexts/AuthContext';

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightHistory, compositionHistory, weeklyVolume, loading } = useClientProgress();
  const { measurements, loading: measurementsLoading } = useMeasurements(user?.id);

  return (
    <div>
      <PageHeader title="Progreso" />

      <div className="space-y-4">
        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Peso</h3>
          {loading ? <Skeleton className="h-48" /> : <WeightChart points={weightHistory} />}
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Composición corporal</h3>
          {loading ? <Skeleton className="h-48" /> : <BodyCompositionChart points={compositionHistory} />}
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Volumen esta semana</h3>
          {loading ? <Skeleton className="h-48" /> : <VolumeChart data={weeklyVolume} />}
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Mapa muscular</h3>
          {loading ? <Skeleton className="h-64" /> : <MuscleHeatmap data={weeklyVolume} />}
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Historial de mediciones</h3>
          {measurementsLoading ? (
            <Skeleton className="h-24" />
          ) : (
            <MeasurementList measurements={measurements} />
          )}
        </Card>
      </div>
    </div>
  );
}
