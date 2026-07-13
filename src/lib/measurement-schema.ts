import { z } from 'zod';

export const measurementSchema = z.object({
  measuredAt: z.string().min(1, 'Selecciona una fecha'),
  weight: z.number().positive('Ingresa el peso'),
  height: z.number().positive('Ingresa la altura'),
  bicipital: z.number().min(0),
  tricipital: z.number().min(0),
  subscapular: z.number().min(0),
  suprailiac: z.number().min(0),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;
