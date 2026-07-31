import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { listingPublishBodySchema } from '@/lib/api/validation/common';
import { unlockCheckoutSchema } from '@/lib/api/validation/payments';

export const publishJobSchema = listingPublishBodySchema.omit({
  pitchDeckDocumentId: true,
  flow: true,
});

export const employerApplicationsQuerySchema = z.object({
  listingId: uuidSchema,
});

export { unlockCheckoutSchema as employerUnlockCheckoutSchema };
