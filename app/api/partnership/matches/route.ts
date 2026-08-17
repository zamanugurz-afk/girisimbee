import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { createPartnershipMatchService } from '@/features/partnership-matching/service';

/** Runtime partnership matches for the signed-in user. Score is not persisted. */
export const GET = withAuth(async (ctx) => {
  const service = createPartnershipMatchService(ctx.container);
  const result = await service.getPartnershipMatches(ctx.userId);
  return ok(result);
});
