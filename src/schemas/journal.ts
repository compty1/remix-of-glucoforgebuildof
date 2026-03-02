/**
 * Phase 19.5: Shared Zod Schemas – Journal
 */
import { z } from 'zod';

export const journalEntrySchema = z.object({
  date: z.string().datetime(),
  glucoseValue: z.number().min(20).max(600).optional(),
  unit: z.enum(['mg/dL', 'mmol/L']).default('mg/dL'),
  carbsGrams: z.number().min(0).max(1000).optional(),
  insulinUnits: z.number().min(0).max(200).optional(),
  insulinType: z.enum(['rapid', 'long-acting', 'mixed']).optional(),
  exerciseMinutes: z.number().min(0).max(720).optional(),
  exerciseType: z.enum(['aerobic', 'anaerobic', 'mixed', 'yoga', 'walking', 'swimming', 'cycling']).optional(),
  mealType: z.enum(['standard', 'high-fat', 'high-protein', 'high-fiber', 'mixed', 'liquid']).optional(),
  isSickDay: z.boolean().default(false),
  stressLevel: z.enum(['none', 'mild', 'moderate', 'severe']).default('none'),
  notes: z.string().max(5000).optional(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;
