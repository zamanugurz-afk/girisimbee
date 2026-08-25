import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createServiceRoleClient } from '@/lib/supabase/service';
import type { ConversationListItem } from '@/features/messaging/types/messaging-view.types';

/**
 * GET /api/conversations
 * Returns the complete conversations list for the authenticated user,
 * with full server-authoritative hydration and idempotent auto-healing for job applications.
 */
export const GET = withAuth(async (ctx) => {
  let admin = null;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.warn('[conversations/get] service role client unavailable, using container fallback:', err);
  }

  if (!admin) {
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
  }

  const db = admin;

  // 1. Auto-sync unlinked applications for this user (both employer & candidate) with service-role authority
  try {
    const { data: myOwnedListings } = await db
      .from('marketplace_listings')
      .select('id, title, slug, owner_id')
      .eq('owner_id', ctx.userId)
      .is('deleted_at', null);

    const ownedListings = ((myOwnedListings ?? []) as Array<{ id: string; slug?: string; title?: string; owner_id: string }>);
    const ownedListingIds = ownedListings.map((l) => l.id);
    const ownedListingSlugs = ownedListings.map((l) => l.slug).filter(Boolean) as string[];
    const allListingMatchIds = Array.from(new Set([...ownedListingIds, ...ownedListingSlugs]));

    const { data: myProfiles } = await db
      .from('marketplace_profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .is('deleted_at', null);

    const myProfileIds = ((myProfiles ?? []) as Array<{ id: string }>).map((p) => p.id);

    const appMap = new Map<string, any>();

    if (allListingMatchIds.length > 0) {
      const { data: employerApps } = await db
        .from('marketplace_applications')
        .select('id, listing_id, applicant_profile_id, cover_message, conversation_id, status, created_at')
        .in('listing_id', allListingMatchIds)
        .is('deleted_at', null);
      for (const app of (employerApps ?? []) as any[]) {
        appMap.set(app.id, app);
      }
    }

    if (myProfileIds.length > 0) {
      const { data: applicantApps } = await db
        .from('marketplace_applications')
        .select('id, listing_id, applicant_profile_id, cover_message, conversation_id, status, created_at')
        .in('applicant_profile_id', myProfileIds)
        .is('deleted_at', null);
      for (const app of (applicantApps ?? []) as any[]) {
        appMap.set(app.id, app);
      }
    }

    for (const app of appMap.values()) {
      try {
        // Resolve applicant user ID from applicant_profile_id
        let applicantUserId = ctx.userId;
        if (app.applicant_profile_id) {
          const { data: applicantProf } = await db
            .from('marketplace_profiles')
            .select('user_id, display_name')
            .eq('id', app.applicant_profile_id)
            .maybeSingle();
          if (applicantProf?.user_id) {
            applicantUserId = ids.user(applicantProf.user_id);
          }
        }

        // Resolve canonical listing ID (UUID) and employer user ID from listing
        const matchedListing = ownedListings.find(
          (l) => l.id === app.listing_id || (l.slug && l.slug === app.listing_id),
        );
        let canonicalListingId = matchedListing?.id || app.listing_id;
        let employerUserId = matchedListing?.owner_id ? ids.user(matchedListing.owner_id) : ctx.userId;

        if (!matchedListing) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.listing_id);
          const listingQuery = db.from('marketplace_listings').select('id, owner_id, title');
          const { data: listingData } = isUuid
            ? await listingQuery.eq('id', app.listing_id).maybeSingle()
            : await listingQuery.eq('slug', app.listing_id).maybeSingle();

          if (listingData?.id) canonicalListingId = listingData.id;
          if (listingData?.owner_id) employerUserId = ids.user(listingData.owner_id);
        }

        // Check if a conversation already exists for this application
        const { data: existingConv } = await db
          .from('marketplace_conversations')
          .select('id')
          .eq('application_id', app.id)
          .is('deleted_at', null)
          .maybeSingle();

        let targetConvId = existingConv?.id || app.conversation_id;

        // If conversation does not exist, create it with service-role authority
        if (!targetConvId) {
          targetConvId = crypto.randomUUID();
          const { error: insConvErr } = await db.from('marketplace_conversations').insert({
            id: targetConvId,
            listing_id: canonicalListingId,
            application_id: app.id,
            kind: 'application',
            status: 'open',
            last_message_preview: app.cover_message || 'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.',
            last_message_at: app.created_at || new Date().toISOString(),
          });
          if (insConvErr) {
            console.error('[application.auto_heal.failed]', { applicationId: app.id, error: insConvErr.message });
            continue;
          }
        }

        // Ensure both participants exist in marketplace_conversation_participants
        const participantsToEnsure = Array.from(new Set([applicantUserId, employerUserId].filter(Boolean)));
        for (const pUid of participantsToEnsure) {
          await db.from('marketplace_conversation_participants').upsert(
            {
              conversation_id: targetConvId,
              user_id: pUid,
            },
            { onConflict: 'conversation_id,user_id' },
          );
        }

        // Ensure initial message exists in marketplace_messages
        const { data: existingMsg } = await db
          .from('marketplace_messages')
          .select('id')
          .eq('conversation_id', targetConvId)
          .limit(1);

        if (!existingMsg || existingMsg.length === 0) {
          await db.from('marketplace_messages').insert({
            id: crypto.randomUUID(),
            conversation_id: targetConvId,
            sender_id: applicantUserId,
            body: app.cover_message || 'Merhaba, ilanınız için iş başvurumu ve kariyer profilimi ilettim.',
            status: 'sent',
          });
        }

        // Ensure application.conversation_id is updated in marketplace_applications
        if (app.conversation_id !== targetConvId) {
          await db
            .from('marketplace_applications')
            .update({ conversation_id: targetConvId })
            .eq('id', app.id);
        }
      } catch (appSyncErr) {
        console.error('[application.auto_heal.failed]', {
          applicationId: app.id,
          error: appSyncErr instanceof Error ? appSyncErr.message : String(appSyncErr),
        });
      }
    }
  } catch (syncErr) {
    console.error('[application.auto_heal.failed]', {
      error: syncErr instanceof Error ? syncErr.message : String(syncErr),
    });
  }

  // 2. Fetch all conversations where ctx.userId is a participant
  try {
    const { data: participantRows, error: pErr } = await db
      .from('marketplace_conversation_participants')
      .select('conversation_id')
      .eq('user_id', ctx.userId);

    if (pErr) throw pErr;

    const conversationIds = Array.from(
      new Set(((participantRows ?? []) as Array<{ conversation_id: string }>).map((r) => r.conversation_id)),
    );

    if (conversationIds.length === 0) {
      return ok({ items: [], total: 0, page: 1, limit: 100 });
    }

    const { data: conversationRows, error: cErr } = await db
      .from('marketplace_conversations')
      .select('*')
      .in('id', conversationIds)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (cErr) throw cErr;

    // 3. Hydrate each conversation item
    const items: ConversationListItem[] = await Promise.all(
      ((conversationRows ?? []) as Array<Record<string, any>>).map(async (row) => {
        // Fetch all participants of this conversation
        const { data: allParticipants } = await db
          .from('marketplace_conversation_participants')
          .select('user_id')
          .eq('conversation_id', row.id);

        const participantUserIds = ((allParticipants ?? []) as Array<{ user_id: string }>).map((p) => p.user_id);
        const otherUserId =
          participantUserIds.find((id) => id !== ctx.userId) ||
          participantUserIds[0] ||
          ctx.userId;

        // Fetch other participant profile
        const { data: otherProf } = await db
          .from('marketplace_profiles')
          .select('id, user_id, display_name, username, avatar_url, is_verified, investor_verified')
          .eq('user_id', otherUserId)
          .is('deleted_at', null)
          .maybeSingle();

        // Fetch listing if present
        let listingTitle: string | null = null;
        let companyName: string | null = null;

        if (row.listing_id) {
          const { data: listingData } = await db
            .from('marketplace_listings')
            .select('id, title, slug, company_id')
            .eq('id', row.listing_id)
            .is('deleted_at', null)
            .maybeSingle();

          if (listingData?.title) listingTitle = listingData.title;

          if (listingData?.company_id || row.company_id) {
            const companyIdToUse = listingData?.company_id || row.company_id;
            const { data: compData } = await db
              .from('marketplace_companies')
              .select('id, name')
              .eq('id', companyIdToUse)
              .is('deleted_at', null)
              .maybeSingle();
            if (compData?.name) companyName = compData.name;
          }
        }

        // Count unread messages for ctx.userId
        const { count: unreadCount } = await db
          .from('marketplace_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', row.id)
          .neq('sender_id', ctx.userId)
          .is('read_at', null)
          .is('deleted_at', null);

        const kind =
          row.kind === 'support'
            ? 'support'
            : row.kind === 'application' || Boolean(row.application_id)
              ? 'application'
              : 'listing';

        const otherParticipant =
          kind === 'support'
            ? {
                userId: ids.user(otherUserId),
                displayName: 'Girisimbee Destek',
                username: 'destek',
                avatarUrl: null,
                userVerified: true,
                investorVerified: false,
                companyVerified: false,
                companyName: 'Destek ekibi',
              }
            : {
                userId: ids.user(otherUserId),
                displayName: otherProf?.display_name || 'Kullanıcı',
                username: otherProf?.username || otherUserId.slice(0, 8),
                avatarUrl: otherProf?.avatar_url || null,
                userVerified: Boolean(otherProf?.is_verified),
                investorVerified: Boolean(otherProf?.investor_verified),
                companyVerified: Boolean(companyName),
                companyName,
              };

        return {
          conversation: {
            id: ids.conversation(row.id),
            kind,
            listingId: row.listing_id ? ids.listing(row.listing_id) : null,
            companyId: row.company_id ? ids.company(row.company_id) : null,
            applicationId: row.application_id ? ids.application(row.application_id) : null,
            supportInquiryId: row.support_inquiry_id ?? null,
            status: row.status || 'open',
            lastMessageAt: row.last_message_at,
            lastMessagePreview: row.last_message_preview,
            participantIds: participantUserIds.map((id) => ids.user(id)),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          },
          otherParticipant,
          listingTitle: kind === 'support' ? 'Girisimbee Destek' : listingTitle,
          companyName: kind === 'support' ? 'Destek ekibi' : companyName,
          unreadCount: unreadCount ?? 0,
        };
      }),
    );

    return ok({
      items,
      total: items.length,
      page: 1,
      limit: 100,
    });
  } catch (err) {
    console.error('[conversations.get.failed]', {
      error: err instanceof Error ? err.message : String(err),
    });
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
  }
});
