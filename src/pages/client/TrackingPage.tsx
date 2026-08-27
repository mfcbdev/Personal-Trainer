import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SliderInput } from '../../components/onboarding/SliderInput';
import { DailyLogRow } from '../../components/tracking/DailyLogRow';
import { useWeeklyTracking, weekDates } from '../../hooks/useWeeklyTracking';
import { useActiveProgram } from '../../hooks/useActiveProgram';
import { useToast } from '../../contexts/ToastContext';
import { flattenSessions } from '../../lib/program-utils';
import { getMondayOf, getCurrentWeekStart } from '../../lib/scheduling';
import {
  weeklyTrackingSchema,
  weeklyTrackingDefaults,
  type WeeklyTrackingFormInput,
} from '../../lib/weekly-tracking-schema';

export default function TrackingPage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const { tracking, dailyLogs, loading, submit } = useWeeklyTracking(weekStart);
  const { data: programData } = useActiveProgram();
  const [submitting, setSubmitting] = useState(false);

  const dates = useMemo(() => weekDates(weekStart), [weekStart]);

  const form = useForm<WeeklyTrackingFormInput>({
    resolver: zodResolver(weeklyTrackingSchema),
    defaultValues: weeklyTrackingDefaults(dates),
  });

  const sessionsCompleted = useMemo(() => {
    if (!programData) return 0;
    const flat = flattenSessions(programData);
    return flat.filter((f) => f.session.scheduled_date && dates.includes(f.session.scheduled_date) && f.session.completed)
      .length;
  }, [programData, dates]);

  useEffect(() => {
    if (loading) return;
    if (tracking) {
      form.reset({
        fatigue: tracking.fatigue ?? 5,
        recovery: tracking.recovery ?? 5,
        energy: tracking.energy ?? 5,
        mood: tracking.mood ?? 5,
        weight: tracking.weight,
        nutritionAdherence: tracking.nutrition_adherence ?? 5,
        satiety: tracking.satiety ?? 5,
        hydration: tracking.hydration ?? 5,
        planFollowing: tracking.plan_following ?? 5,
        sleepHours: tracking.sleep_hours,
        sleepQuality: tracking.sleep_quality ?? 5,
        stress: tracking.stress ?? 5,
        motivation: tracking.motivation ?? 5,
        proudestMoment: tracking.proudest_moment ?? '',
        dailyLogs: dates.map((date) => {
          const existing = dailyLogs.find((l) => l.day_date === date);
          return { date, status: existing?.status ?? 'in_progress', observation: existing?.observation ?? '' };
        }),
      });
    } else {
      form.reset(weeklyTrackingDefaults(dates));
    }
  }, [tracking, dailyLogs, loading, weekStart]);

  async function onSubmit(values: WeeklyTrackingFormInput) {
    setSubmitting(true);
    try {
      await submit({
        ...values,
        proudestMoment: values.proudestMoment ?? '',
        dailyLogs: values.dailyLogs.map((log) => ({ ...log, observation: log.observation ?? '' })),
        sessionsCompleted,
      });
      showSuccess('Seguimiento semanal guardado.');
      navigate('/c/today');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar el seguimiento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Seguimiento semanal" />

      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={() => setWeekStart((d) => getMondayOf(new Date(d.getTime() - 86400000)))} className="h-9 w-9 text-zinc-400">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-zinc-300 capitalize">
          Semana del {format(weekStart, "d 'de' MMMM", { locale: es })}
        </span>
        <button type="button" onClick={() => setWeekStart((d) => getMondayOf(new Date(d.getTime() + 7 * 86400000)))} className="h-9 w-9 text-zinc-400">
          <ChevronRight size={18} />
        </button>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Entrenamiento</h3>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-zinc-400">Sesiones completadas</span>
            <span className="text-zinc-50 font-medium">{sessionsCompleted}</span>
          </div>
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="fatigue"
              render={({ field }) => <SliderInput label="Grado de cansancio" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="recovery"
              render={({ field }) => <SliderInput label="Recuperación" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="energy"
              render={({ field }) => <SliderInput label="Energía" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="mood"
              render={({ field }) => <SliderInput label="Estado de ánimo" value={field.value} onChange={field.onChange} />}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Nutrición</h3>
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1.5">Peso en ayunas (kg)</label>
            <Controller
              control={form.control}
              name="weight"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.1"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              )}
            />
          </div>
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="nutritionAdherence"
              render={({ field }) => (
                <SliderInput label="Alimentación según plan" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={form.control}
              name="satiety"
              render={({ field }) => <SliderInput label="Saciedad" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="hydration"
              render={({ field }) => <SliderInput label="Hidratación" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="planFollowing"
              render={({ field }) => (
                <SliderInput label="Seguimiento del plan" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Descanso</h3>
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1.5">Horas de sueño</label>
            <Controller
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.5"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              )}
            />
          </div>
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="sleepQuality"
              render={({ field }) => (
                <SliderInput label="Calidad del sueño" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={form.control}
              name="stress"
              render={({ field }) => <SliderInput label="Nivel de estrés" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={form.control}
              name="motivation"
              render={({ field }) => <SliderInput label="Motivación" value={field.value} onChange={field.onChange} />}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-1">Bitácora diaria</h3>
          {dates.map((_, index) => (
            <DailyLogRow key={index} index={index} control={form.control} />
          ))}
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Momento más orgulloso de la semana</h3>
          <Controller
            control={form.control}
            name="proudestMoment"
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                placeholder="¿Qué logro de esta semana te enorgullece más?"
                className="w-full rounded-lg border border-zinc-800 bg-base px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
              />
            )}
          />
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar seguimiento'}
        </Button>
      </form>
    </div>
  );
}
