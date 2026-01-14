import { z } from 'zod';

/**
 * Centralized Zod validation schemas for GlucoForge
 * 
 * Security: All user inputs MUST be validated using these schemas
 * to prevent injection attacks and data corruption.
 */

// ============= Authentication Schemas =============

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be less than 100 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string().nonempty({ message: 'Please confirm your password' }),
  displayName: z
    .string()
    .trim()
    .max(100, { message: 'Display name must be less than 100 characters' })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============= Profile Schemas =============

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(100, { message: 'Display name must be less than 100 characters' })
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, { message: 'Bio must be less than 500 characters' })
    .optional(),
});

// ============= Survey Schemas =============

export const surveyResponseSchema = z.object({
  surveyId: z.string().uuid({ message: 'Invalid survey ID' }),
  responses: z.record(z.any()).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one response is required' }
  ),
});

// ============= Contact Form Schemas =============

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  message: z
    .string()
    .trim()
    .nonempty({ message: 'Message is required' })
    .max(1000, { message: 'Message must be less than 1000 characters' }),
});

// ============= Edge Function Schemas =============

export const dailyBriefingRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  dayNumber: z
    .number()
    .int()
    .min(1, { message: 'Day number must be at least 1' })
    .max(365, { message: 'Day number must be at most 365' })
    .optional(),
});

export const donationAmountSchema = z.object({
  amount: z
    .number()
    .positive({ message: 'Donation amount must be positive' })
    .min(5, { message: 'Minimum donation amount is $5' })
    .max(100000, { message: 'Maximum donation amount is $100,000' })
    .finite({ message: 'Invalid donation amount' }),
});

// ============= Type Exports =============

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SurveyResponseInput = z.infer<typeof surveyResponseSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type DailyBriefingRequestInput = z.infer<typeof dailyBriefingRequestSchema>;
export type DonationAmountInput = z.infer<typeof donationAmountSchema>;
