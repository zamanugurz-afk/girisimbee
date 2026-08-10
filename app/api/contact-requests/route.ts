import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';

/** GET — owner inbox of incoming contact requests */
export const GET = withAuth(async (ctx) => {
  const requests = await ctx.container.contactRequestService.listIncomingForOwner(ctx.userId);
  return ok({ requests });
});
