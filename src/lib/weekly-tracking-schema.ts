import { z } from 'zod';

const scale10 = z.number().min(1).max(10);

export const weeklyTrackingSchema = z.object({
  fatigue: scale10,
  recovery: scale10,
  energy: scale10,
  mood: scale10,
  weight: z.number().min(0).nullable(),
  nutritionAdherence: scale10,
  satiety: scale10,
  hydration: scale10,
  planFollowing: scale10,
  sleepHours: z.number().min(0).max(24).nullable(),
  sleepQuality: scale10,
  stress: scale10,
  motivation: scale10,
  proudestMoment: z.string().optional(),
  dailyLogs: z.array(
    z.object({
      date: z.string(),
      status: z.enum(['achieved', 'in_progress', 'missed']),
      observation: z.string().optional(),
    }),
  ),
});

export type WeeklyTrackingFormInput = z.infer<typeof weeklyTrackingSchema>;

export const weeklyTrackingDefaults = (dates: string[]): WeeklyTrackingFormInput => ({
  fatigue: 5,
  recovery: 5,
  energy: 5,
  mood: 5,
  weight: null,
  nutritionAdherence: 5,
  satiety: 5,
  hydration: 5,
  planFollowing: 5,
  sleepHours: null,
  sleepQuality: 5,
  stress: 5,
  motivation: 5,
  proudestMoment: '',
  dailyLogs: dates.map((date) => ({ date, status: 'in_progress' as const, observation: '' })),
});
