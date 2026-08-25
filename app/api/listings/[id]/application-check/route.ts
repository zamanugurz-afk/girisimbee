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
  let listingId = ids.listing(id);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/service');
      const admin = createServiceRoleClient();
      const { data: bySlug } = await admin
        .from('marketplace_listings')
        .select('id')
        .eq('slug', id)
        .maybeSingle();
      if (bySlug?.id) {
        listingId = ids.listing(bySlug.id);
      }
    } catch {}
  }

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

      const employerUserId = listingRow?.owner_id ? ids.user(listingRow.owner_id) : ctx.userId;
      const conv = await ctx.container.messagingService.startConversation({
        participantIds: [ctx.userId, employerUserId],
        listingId,
        applicationId: activeApp.id,
        kind: 'application',
        initialMessage: activeApp.coverMessage || 'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.',
      });

      if (conv?.id) {
        conversationId = conv.id;
        try {
          await admin
            .from('marketplace_applications')
            .update({ conversation_id: conv.id })
            .eq('id', activeApp.id);
        } catch {}
        try {
          await ctx.container.applicationRepository.update(activeApp.id, {
            conversationId: conv.id,
          });
        } catch {}
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
