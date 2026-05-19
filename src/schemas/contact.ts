/**
 * Wave 3 — Zod schema for the public contact form.
 * Server-side length caps live in the contact_submissions RLS WITH CHECK;
 * this schema mirrors them client-side so users get inline errors.
 */
import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  subject: z.string().trim().min(3, "Subject is too short").max(200),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please add more detail").max(10_000),
  _honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;