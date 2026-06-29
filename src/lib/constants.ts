export const GROW_PHASES = ['G', 'R', 'O', 'W'] as const;
export type GrowPhase = (typeof GROW_PHASES)[number];

export const PHASE_LABELS: Record<GrowPhase, string> = {
  G: 'Ganancia',
  R: 'Resistencia',
  O: 'Optimización',
  W: 'Definición',
};

export const PHASE_COLORS: Record<GrowPhase, { bg: string; text: string }> = {
  G: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  R: { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  O: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  W: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
};

export const MUSCLE_GROUPS = [
  'Pecho',
  'Hombros',
  'Tríceps',
  'Espalda',
  'Bíceps',
  'Cuádriceps',
  'Isquiotibiales y Glúteos',
  'Pantorrillas',
  'Abdomen',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EXERCISE_ZONES = ['upper_body', 'lower_body', 'core'] as const;
export const MOVEMENT_TYPES = ['push', 'pull', 'legs', 'core', 'cardio'] as const;

export const ZONE_LABELS: Record<(typeof EXERCISE_ZONES)[number], string> = {
  upper_body: 'Tren superior',
  lower_body: 'Tren inferior',
  core: 'Core',
};

export const MOVEMENT_TYPE_LABELS: Record<(typeof MOVEMENT_TYPES)[number], string> = {
  push: 'Empuje',
  pull: 'Tracción',
  legs: 'Piernas',
  core: 'Core',
  cardio: 'Cardio',
};

// Mirrors the classification baked into supabase/migrations/013_seed_exercises.sql
export const MUSCLE_GROUP_CLASSIFICATION: Record<
  MuscleGroup,
  { zone: (typeof EXERCISE_ZONES)[number]; movementType: (typeof MOVEMENT_TYPES)[number] }
> = {
  Pecho: { zone: 'upper_body', movementType: 'push' },
  Hombros: { zone: 'upper_body', movementType: 'push' },
  Tríceps: { zone: 'upper_body', movementType: 'push' },
  Espalda: { zone: 'upper_body', movementType: 'pull' },
  Bíceps: { zone: 'upper_body', movementType: 'pull' },
  Cuádriceps: { zone: 'lower_body', movementType: 'legs' },
  'Isquiotibiales y Glúteos': { zone: 'lower_body', movementType: 'legs' },
  Pantorrillas: { zone: 'lower_body', movementType: 'legs' },
  Abdomen: { zone: 'core', movementType: 'core' },
};
