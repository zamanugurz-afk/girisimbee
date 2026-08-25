import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createServiceRoleClient } from '@/lib/supabase/service';

/**
 * POST /api/messaging/sync-applications
 * Automatically ensures every job application where the authenticated user is either
 * the employer (listing owner) or applicant has an active conversation thread.
 */
export const POST = withAuth(async (ctx) => {
  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return ok({ synced: 0 });
  }

  // 1. Find all listings owned by this user (Employer)
  const { data: myOwnedListings } = await admin
    .from('marketplace_listings')
    .select('id, title, owner_id')
    .eq('owner_id', ctx.userId)
    .is('deleted_at', null);

  const ownedListingIds = (myOwnedListings ?? []).map((l) => l.id);

  // 2. Find all profile IDs belonging to this user (Applicant)
  const { data: myProfiles } = await admin
    .from('marketplace_profiles')
    .select('id')
    .eq('user_id', ctx.userId)
    .is('deleted_at', null);

  const myProfileIds = (myProfiles ?? []).map((p) => p.id);

  if (ownedListingIds.length === 0 && myProfileIds.length === 0) {
    return ok({ synced: 0 });
  }

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

  const applications = Array.from(appMap.values());
  if (applications.length === 0) {
    return ok({ synced: 0 });
  }

  let synced = 0;

  for (const app of applications) {
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
      // Resolve applicant user_id
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

      // Resolve listing and employer user_id
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
          synced++;
        }
      } catch (err) {
        console.warn('[sync-applications] failed to heal application conversation:', err);
      }
    }
  }

  return ok({ synced });
});
