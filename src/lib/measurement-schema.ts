import { z } from 'zod';

// react-hook-form's { valueAsNumber: true } yields NaN when the field is
// blank. `.or(z.nan())` accepts that, and `handleFormSubmit` converts
// NaN → null before writing to Supabase.
const optionalNumber = z.union([z.number().min(0), z.nan()]).nullable();

export const measurementSchema = z.object({
  measuredAt: z.string().min(1, 'Selecciona una fecha'),
  weight: z.number().positive('Ingresa el peso'),
  height: z.number().positive('Ingresa la altura'),
  bicipital: z.number().min(0),
  tricipital: z.number().min(0),
  subscapular: z.number().min(0),
  suprailiac: z.number().min(0),
  waist: optionalNumber,
  hip: optionalNumber,
  thigh: optionalNumber,
  bicepsCircumference: optionalNumber,
});

export type MeasurementInput = z.infer<typeof measurementSchema>;

export function toDbNumber(value: number | null): number | null {
  if (value == null) return null;
  if (Number.isNaN(value)) return null;
  return value;
}
