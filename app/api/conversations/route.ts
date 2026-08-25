import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createServiceRoleClient } from '@/lib/supabase/service';

/**
 * GET /api/conversations
 * Returns the paginated conversations list for the authenticated user,
 * ensuring all active job applications are synced and present.
 */
export const GET = withAuth(async (ctx) => {
  let admin = null;
  try {
    admin = createServiceRoleClient();
  } catch {}

  // 1. Auto-sync unlinked applications for this user
  if (admin) {
    try {
      // Find listings owned by this user
      const { data: myOwnedListings } = await admin
        .from('marketplace_listings')
        .select('id, title, owner_id')
        .eq('owner_id', ctx.userId)
        .is('deleted_at', null);

      const ownedListingIds = (myOwnedListings ?? []).map((l) => l.id);

      // Find profiles for this user
      const { data: myProfiles } = await admin
        .from('marketplace_profiles')
        .select('id')
        .eq('user_id', ctx.userId)
        .is('deleted_at', null);

      const myProfileIds = (myProfiles ?? []).map((p) => p.id);

      const appMap = new Map<string, any>();

      if (ownedListingIds.length > 0) {
        const { data: employerApps } = await admin
          .from('marketplace_applications')
          .select('id, listing_id, applicant_profile_id, cover_message, conversation_id, status, created_at')
          .in('listing_id', ownedListingIds)
          .is('deleted_at', null);
        for (const app of employerApps ?? []) {
          appMap.set(app.id, app);
        }
      }

      if (myProfileIds.length > 0) {
        const { data: applicantApps } = await admin
          .from('marketplace_applications')
          .select('id, listing_id, applicant_profile_id, cover_message, conversation_id, status, created_at')
          .in('applicant_profile_id', myProfileIds)
          .is('deleted_at', null);
        for (const app of applicantApps ?? []) {
          appMap.set(app.id, app);
        }
      }

      for (const app of appMap.values()) {
        let convId = app.conversation_id;
        if (convId) {
          const { data: convExists } = await admin
            .from('marketplace_conversations')
            .select('id')
            .eq('id', convId)
            .maybeSingle();
          if (!convExists) {
            convId = null;
          }
        }

        if (!convId) {
          let applicantUserId = ctx.userId;
          if (app.applicant_profile_id) {
            const { data: applicantProf } = await admin
              .from('marketplace_profiles')
              .select('user_id, display_name')
              .eq('id', app.applicant_profile_id)
              .maybeSingle();
            if (applicantProf?.user_id) {
              applicantUserId = ids.user(applicantProf.user_id);
            }
          }

          let employerUserId = ctx.userId;
          const { data: listingData } = await admin
            .from('marketplace_listings')
            .select('owner_id, title')
            .eq('id', app.listing_id)
            .maybeSingle();
          if (listingData?.owner_id) {
            employerUserId = ids.user(listingData.owner_id);
          }

          try {
            const conv = await ctx.container.messagingService.startConversation({
              participantIds: [applicantUserId, employerUserId],
              listingId: ids.listing(app.listing_id),
              applicationId: ids.application(app.id),
              kind: 'application',
              initialMessage: app.cover_message || 'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.',
            });

            if (conv?.id) {
              await admin
                .from('marketplace_applications')
                .update({ conversation_id: conv.id })
                .eq('id', app.id);
            }
          } catch (err) {
            console.warn('[conversations/get] sync failed for application:', err);
          }
        }
      }
    } catch (syncErr) {
      console.warn('[conversations/get] sync process error:', syncErr);
    }
  }

  // 2. Fetch conversation items for this user
  const result = await ctx.container.messagingService.listConversationItems(ctx.userId, {
    page: 1,
    limit: 100,
  });

  return ok({
    items: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});
