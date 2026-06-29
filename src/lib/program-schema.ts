import { z } from 'zod';

export const programSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre para el programa'),
  startDate: z.string().min(1, 'Selecciona una fecha de inicio'),
});

export type ProgramInput = z.infer<typeof programSchema>;
