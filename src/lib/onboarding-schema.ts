import { z } from 'zod';

const frequencyScale = z.enum(['never', 'sometimes', 'often', 'always']);

export const onboardingSchema = z.object({
  // Step 1 — Personal Info
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  nationality: z.string().min(2, 'Ingresa tu nacionalidad'),
  sex: z.enum(['Masculino', 'Femenino', 'Otro'], { message: 'Selecciona una opción' }),
  birthDate: z.string().min(1, 'Ingresa tu fecha de nacimiento'),
  phone: z.string().min(6, 'Ingresa tu teléfono'),

  // Step 2 — Health Evaluation
  cardiacCondition: z.boolean(),
  cardiacDetail: z.string().optional(),
  pathology: z.boolean(),
  pathologyDetail: z.string().optional(),
  boneJointCondition: z.boolean(),
  boneJointDetail: z.string().optional(),
  medication: z.boolean(),
  medicationDetail: z.string().optional(),
  additionalNotes: z.string().optional(),

  // Step 3 — Lifestyle
  smoking: frequencyScale,
  alcohol: frequencyScale,
  nutrition: frequencyScale,
  physicalActivity: frequencyScale,
  otherActivities: z.boolean(),
  otherActivitiesDetail: z.string().optional(),

  // Step 4 — Daily Habits
  dailySteps: z.number().min(0).max(100000),
  dailyActiveHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(0).max(10),
  stress: z.number().min(0).max(10),

  // Step 5 — Objectives
  objectives: z.string().min(10, 'Cuéntanos un poco más sobre tu objetivo'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const onboardingDefaults: OnboardingInput = {
  fullName: '',
  nationality: '',
  sex: 'Masculino',
  birthDate: '',
  phone: '',
  cardiacCondition: false,
  cardiacDetail: '',
  pathology: false,
  pathologyDetail: '',
  boneJointCondition: false,
  boneJointDetail: '',
  medication: false,
  medicationDetail: '',
  additionalNotes: '',
  smoking: 'never',
  alcohol: 'never',
  nutrition: 'sometimes',
  physicalActivity: 'sometimes',
  otherActivities: false,
  otherActivitiesDetail: '',
  dailySteps: 5000,
  dailyActiveHours: 1,
  sleepQuality: 5,
  stress: 5,
  objectives: '',
};

export const STEP_FIELDS: (keyof OnboardingInput)[][] = [
  ['fullName', 'nationality', 'sex', 'birthDate', 'phone'],
  ['cardiacCondition', 'pathology', 'boneJointCondition', 'medication', 'additionalNotes'],
  ['smoking', 'alcohol', 'nutrition', 'physicalActivity', 'otherActivities'],
  ['dailySteps', 'dailyActiveHours', 'sleepQuality', 'stress'],
  ['objectives'],
];

export const TOTAL_STEPS = STEP_FIELDS.length + 1; // + confirmation step
