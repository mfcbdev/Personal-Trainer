import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { OnboardingStepShell } from '../../components/onboarding/OnboardingStepShell';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import {
  onboardingSchema,
  onboardingDefaults,
  STEP_FIELDS,
  type OnboardingInput,
} from '../../lib/onboarding-schema';

import { Step1PersonalInfo } from './steps/Step1PersonalInfo';
import { Step2Health } from './steps/Step2Health';
import { Step3Lifestyle } from './steps/Step3Lifestyle';
import { Step4DailyHabits } from './steps/Step4DailyHabits';
import { Step5Objectives } from './steps/Step5Objectives';
import { Step6Confirmation } from './steps/Step6Confirmation';

const STEP_META = [
  { title: 'Cuéntanos sobre ti', component: Step1PersonalInfo },
  { title: 'Evaluación de salud', subtitle: 'Esta información nos ayuda a entrenarte de forma segura.', component: Step2Health },
  { title: 'Estilo de vida', component: Step3Lifestyle },
  { title: 'Hábitos diarios', component: Step4DailyHabits },
  { title: '¿Cuál es tu objetivo?', component: Step5Objectives },
  { title: 'Confirma tus datos', component: Step6Confirmation },
];

export default function OnboardingFlow() {
  const { user, refreshProfile } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboardingDefaults,
    mode: 'onSubmit',
  });

  const isLastStep = step === STEP_META.length - 1;
  const StepComponent = STEP_META[step].component;

  async function goNext() {
    if (step < STEP_FIELDS.length) {
      const valid = await form.trigger(STEP_FIELDS[step]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEP_META.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: OnboardingInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error: healthError } = await supabase.from('health_evaluation').insert({
        client_id: user.id,
        cardiac_condition: values.cardiacCondition,
        cardiac_detail: values.cardiacDetail || null,
        pathology: values.pathology,
        pathology_detail: values.pathologyDetail || null,
        bone_joint_condition: values.boneJointCondition,
        bone_joint_detail: values.boneJointDetail || null,
        medication: values.medication,
        medication_detail: values.medicationDetail || null,
        additional_notes: values.additionalNotes || null,
      });
      if (healthError) throw healthError;

      const { error: lifestyleError } = await supabase.from('lifestyle_evaluation').insert({
        client_id: user.id,
        smoking: values.smoking,
        alcohol: values.alcohol,
        nutrition: values.nutrition,
        physical_activity: values.physicalActivity,
        other_activities: values.otherActivities,
        other_activities_detail: values.otherActivitiesDetail || null,
        daily_steps: values.dailySteps,
        daily_active_hours: values.dailyActiveHours,
        sleep_quality: values.sleepQuality,
        stress: values.stress,
      });
      if (lifestyleError) throw lifestyleError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          nationality: values.nationality,
          sex: values.sex,
          birth_date: values.birthDate,
          phone: values.phone,
          objectives: values.objectives,
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/c/today', { replace: true });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo completar el registro.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-full">
        <OnboardingStepShell
          step={step + 1}
          total={STEP_META.length}
          title={STEP_META[step].title}
          subtitle={STEP_META[step].subtitle}
          footer={
            <>
              {step > 0 && (
                <Button type="button" variant="secondary" onClick={goBack} className="px-4">
                  <ChevronLeft size={18} />
                </Button>
              )}
              {isLastStep ? (
                <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Button>
              ) : (
                <Button type="button" size="lg" className="flex-1" onClick={goNext}>
                  Continuar
                </Button>
              )}
            </>
          }
        >
          <StepComponent />
        </OnboardingStepShell>
      </form>
    </FormProvider>
  );
}
