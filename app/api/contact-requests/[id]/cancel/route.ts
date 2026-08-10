import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';

/** POST — requester cancels a pending contact request */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const requestId = ids.contactRequest(params.id);
  const view = await ctx.container.contactRequestService.cancel(requestId, ctx.userId);
  return ok({ request: view });
});
