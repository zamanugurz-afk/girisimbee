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

  // 3. Find all applications where user is employer OR applicant
  const filters: string[] = [];
  if (ownedListingIds.length > 0) {
    filters.push(`listing_id.in.(${ownedListingIds.join(',')})`);
  }
  if (myProfileIds.length > 0) {
    filters.push(`applicant_profile_id.in.(${myProfileIds.join(',')})`);
  }

  const { data: applications, error: appError } = await admin
    .from('marketplace_applications')
    .select('id, listing_id, applicant_profile_id, cover_message, conversation_id, status, created_at')
    .is('deleted_at', null)
    .or(filters.join(','));

  if (appError || !applications || applications.length === 0) {
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
      const { data: applicantProf } = await admin
        .from('marketplace_profiles')
        .select('user_id, display_name')
        .eq('id', app.applicant_profile_id)
        .maybeSingle();

      const applicantUserId = applicantProf?.user_id ? ids.user(applicantProf.user_id) : ctx.userId;

      // Resolve listing and employer user_id
      const { data: listingData } = await admin
        .from('marketplace_listings')
        .select('owner_id, title')
        .eq('id', app.listing_id)
        .maybeSingle();

      const employerUserId = listingData?.owner_id ? ids.user(listingData.owner_id) : ctx.userId;

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
