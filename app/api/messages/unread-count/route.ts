import { ok, apiError } from '@/lib/api/response';
import { withAuth } from '@/lib/api/with-auth';
import { ids } from '@/lib/domain/ids';

/** GET — total unread marketplace messages for the signed-in user (Mesajlarım badge). */
export const GET = withAuth(async (ctx) => {
  try {
    const count = await ctx.container.messagingService.getUnreadCount(ids.user(ctx.user.id));
    return ok({ count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okunmamış sayısı alınamadı';
    return apiError(message, 500, { code: 'UNREAD_COUNT_FAILED' });
  }
});
