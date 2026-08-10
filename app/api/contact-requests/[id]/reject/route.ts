import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';

/** POST — owner rejects a contact request */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const requestId = ids.contactRequest(params.id);
  const view = await ctx.container.contactRequestService.reject(requestId, ctx.userId);
  return ok({ request: view });
});
