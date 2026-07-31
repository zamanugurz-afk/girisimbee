import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { listingPublishBodySchema } from '@/lib/api/validation/common';

export const franchiseBrowseQuerySchema = z.object({
  city: z.string().optional(),
  sector: z.string().optional(),
});

export const franchiseApplySchema = z.object({
  listingId: uuidSchema,
  coverMessage: z.string().max(2000).nullable().optional(),
});

export const franchisePublishSchema = listingPublishBodySchema.extend({
  flow: z.enum(['buy', 'give']),
});

export const franchiseApplicationsQuerySchema = z.object({
  listingId: uuidSchema,
});
