export const GROW_PHASES = ['G', 'R', 'O', 'W'] as const;
export type GrowPhase = (typeof GROW_PHASES)[number];

export const PHASE_LABELS: Record<GrowPhase, string> = {
  G: 'Ganancia',
  R: 'Resistencia',
  O: 'Optimización',
  W: 'Definición',
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

export const EXERCISE_ZONES = ['upper_body', 'lower_body', 'core'] as const;
export const MOVEMENT_TYPES = ['push', 'pull', 'legs', 'core', 'cardio'] as const;
