import { z } from 'zod';
import { MUSCLE_GROUPS } from './constants';

export const exerciseSchema = z.object({
  name: z.string().min(2, 'Ingresa el nombre del ejercicio'),
  muscleGroup: z.enum(MUSCLE_GROUPS, { message: 'Selecciona un grupo muscular' }),
  videoUrl: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
