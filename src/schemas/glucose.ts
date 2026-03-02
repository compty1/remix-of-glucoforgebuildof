/**
 * Phase 19.5: Shared Zod Schemas
 * Glucose data validation schemas used across client and edge functions.
 */
import { z } from 'zod';

export const glucoseReadingSchema = z.object({
  timestamp: z.string().datetime({ message: 'Must be a valid ISO 8601 datetime' }),
  value: z.number().min(20).max(600),
  unit: z.enum(['mg/dL', 'mmol/L']).default('mg/dL'),
  source: z.string().max(100).optional(),
  deviceId: z.string().uuid().optional(),
});

export const glucoseUploadSchema = z.object({
  readings: z.array(glucoseReadingSchema).min(1).max(50000),
  timezone: z.string().max(50).optional(),
  dataSource: z.string().max(100).optional(),
});

export type GlucoseReading = z.infer<typeof glucoseReadingSchema>;
export type GlucoseUpload = z.infer<typeof glucoseUploadSchema>;
