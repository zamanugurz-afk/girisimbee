import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { z } from 'zod';

const querySchema = z.object({
  listingId: z.string().uuid().optional(),
  profileId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  evidence: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/** GET — admin browse of KVKK consent audit records (+ optional evidence) */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.kvkkConsentService;

  if (query.evidence && query.listingId) {
    const evidence = await service.getEvidenceForListing(ids.listing(query.listingId));
    return ok({ evidence });
  }

  const result = await service.findMany(
    {
      listingId: query.listingId ? ids.listing(query.listingId) : undefined,
      profileId: query.profileId ? ids.profile(query.profileId) : undefined,
      userId: query.userId ? ids.user(query.userId) : undefined,
    },
    { page: query.page, limit: query.limit },
  );

  return ok({ records: result.data, pagination: result });
});
