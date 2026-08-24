import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/**
 * Checks if the current authenticated user has already submitted an active application
 * for the specified listing.
 */
export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const listingId = ids.listing(id);

  const existing = await ctx.container.applicationRepository.findMany({
    moduleKey: 'candidates',
    listingId,
    applicantProfileId: ctx.profileId,
  });

  const activeApp = existing.data.find(
    (app) => app.status !== 'withdrawn' && !app.deletedAt,
  );

  if (!activeApp) {
    return ok({
      hasApplied: false,
      application: null,
    });
  }

  const conversationId =
    activeApp.conversationId ||
    (activeApp.metadata?.conversationId as string | undefined) ||
    null;

  return ok({
    hasApplied: true,
    application: {
      id: activeApp.id,
      status: activeApp.status,
      conversationId,
      submittedAt: activeApp.createdAt,
    },
  });
});
