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

  let conversationId =
    activeApp.conversationId ||
    (activeApp.metadata?.conversationId as string | undefined) ||
    null;

  if (!conversationId) {
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/service');
      const admin = createServiceRoleClient();
      const { data: listingRow } = await admin
        .from('marketplace_listings')
        .select('owner_id')
        .eq('id', listingId)
        .maybeSingle();

      if (listingRow?.owner_id) {
        const employerUserId = ids.user(listingRow.owner_id);
        const conv = await ctx.container.messagingService.startConversation({
          participantIds: [ctx.userId, employerUserId],
          listingId,
          applicationId: activeApp.id,
          kind: 'application',
          initialMessage: activeApp.coverMessage || 'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.',
        });

        if (conv?.id) {
          conversationId = conv.id;
          await ctx.container.applicationRepository.update(activeApp.id, {
            conversationId: conv.id,
          });
        }
      }
    } catch (e) {
      console.warn('[application-check] conversation heal warning:', e);
    }
  }

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
