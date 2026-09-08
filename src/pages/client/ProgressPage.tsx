import { useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { WeightChart } from '../../components/progress/WeightChart';
import { BodyCompositionChart } from '../../components/progress/BodyCompositionChart';
import { VolumeChart } from '../../components/progress/VolumeChart';
import { WeeklyComparisonChart } from '../../components/progress/WeeklyComparisonChart';
import { BaseExerciseList } from '../../components/progress/BaseExerciseList';
import { MuscleHeatmap } from '../../components/progress/MuscleHeatmap';
import { PhotoGallery } from '../../components/progress/PhotoGallery';
import { MeasurementList } from '../../components/measurements/MeasurementList';
import { useClientProgress } from '../../hooks/useClientProgress';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useAuth } from '../../contexts/AuthContext';

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightHistory, compositionHistory, weeklyVolume, weeklyComparison, baseExercises, loading } =
    useClientProgress();
  const { measurements, loading: measurementsLoading } = useMeasurements(user?.id);

  const weightSummary = useMemo(() => {
    if (weightHistory.length === 0) return null;
    const current = weightHistory[weightHistory.length - 1];
    const initial = weightHistory[0];
    const delta = Math.round((current.weight - initial.weight) * 10) / 10;
    return { current: current.weight, initial: initial.weight, delta };
  }, [weightHistory]);

  return (
    <div>
      <PageHeader title="Progreso" />

      <div className="space-y-6">
        <section className="space-y-3">
          <SectionHeader title="Mis Registros" subtitle="Cómo va tu peso corporal semana a semana" />
          <Card>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-xs font-medium text-zinc-500 uppercase">Peso corporal</h3>
              {weightSummary && (
                <p className="text-xs text-zinc-500 font-mono">
                  <span className="text-zinc-50 text-sm">{weightSummary.current} kg</span>
                  <span className="mx-1.5 text-zinc-700">·</span>
                  Inicial {weightSummary.initial} kg
                  {weightSummary.delta !== 0 && (
                    <span className={weightSummary.delta > 0 ? 'ml-1 text-red-400' : 'ml-1 text-accent'}>
                      ({weightSummary.delta > 0 ? '+' : ''}
                      {weightSummary.delta})
                    </span>
                  )}
                </p>
              )}
            </div>
            {loading ? <Skeleton className="h-48" /> : <WeightChart points={weightHistory} />}
          </Card>
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Composición corporal</h3>
            {loading ? <Skeleton className="h-48" /> : <BodyCompositionChart points={compositionHistory} />}
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Actividad" subtitle="Volumen de esta semana y comparativa de las últimas 4" />
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Volumen esta semana</h3>
            {loading ? <Skeleton className="h-48" /> : <VolumeChart data={weeklyVolume} />}
          </Card>
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Últimas 4 semanas</h3>
            {loading ? <Skeleton className="h-64" /> : <WeeklyComparisonChart data={weeklyComparison} />}
          </Card>
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Mapa muscular</h3>
            {loading ? <Skeleton className="h-64" /> : <MuscleHeatmap data={weeklyVolume} />}
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Ejercicios base" subtitle="PR y % de aumento por ejercicio" />
          <Card>
            {loading ? <Skeleton className="h-24" /> : <BaseExerciseList items={baseExercises} />}
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Registro fotográfico" subtitle="Frente · perfil · espalda, agrupadas por día" />
          <Card>
            <PhotoGallery />
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Mis Evaluaciones" subtitle="Mediciones mensuales del entrenador" />
          <Card>
            {measurementsLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <MeasurementList measurements={measurements} />
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-zinc-50">{title}</h2>
      <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
    </div>
  );
}
