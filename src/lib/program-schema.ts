import { z } from 'zod';
import { PROGRAM_TEMPLATE_TYPES } from './constants';

export const programSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre para el programa'),
  startDate: z.string().min(1, 'Selecciona una fecha de inicio'),
  templateType: z.enum(PROGRAM_TEMPLATE_TYPES).nullable(),
});

export type ProgramInput = z.infer<typeof programSchema>;
