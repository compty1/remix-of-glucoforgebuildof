/**
 * Phase 19.5: Shared Zod Schemas – Shop / Donations
 */
import { z } from 'zod';

export const shopOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(50),
  idempotencyKey: z.string().max(100),
});

export const donationSchema = z.object({
  amountCents: z.number().int().min(100).max(100_000_00), // $1 – $100,000
  currency: z.enum(['usd', 'eur', 'gbp']).default('usd'),
  isRecurring: z.boolean().default(false),
  message: z.string().max(500).optional(),
  idempotencyKey: z.string().max(100),
});

export type ShopOrder = z.infer<typeof shopOrderSchema>;
export type Donation = z.infer<typeof donationSchema>;
