import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { createCareerMatchService } from '@/features/matching-engine/career-match.service';

/** Runtime career matches for the signed-in user. Score is not persisted. */
export const GET = withAuth(async (ctx) => {
  const service = createCareerMatchService(ctx.container);
  const result = await service.getCareerMatches(ctx.userId);
  return ok(result);
});
