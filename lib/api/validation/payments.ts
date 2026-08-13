import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const packageCheckoutSchema = z.object({
  packageSlug: z.enum(['free', 'single_listing', 'monthly_unlimited', 'company_package']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const unlockCheckoutSchema = z.object({
  applicationId: uuidSchema,
  /** Deprecated client hint — server ignores and uses CANDIDATE_UNLOCK_PRICE_CENTS. */
  amountCents: z.number().int().min(1).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
