import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const packageCheckoutSchema = z.object({
  packageSlug: z.enum(['free', 'single_listing', 'monthly_unlimited', 'company_package']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const unlockCheckoutSchema = z.object({
  applicationId: uuidSchema,
  amountCents: z.number().int().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
