import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createServiceRoleClient } from '@/lib/supabase/service';
import type { ConversationListItem } from '@/features/messaging/types/messaging-view.types';

/**
 * GET /api/conversations
 * Returns the complete conversations list for the authenticated user with ultra-fast batch hydration (0 N+1 queries).
 */
export const GET = withAuth(async (ctx) => {
  let db: any = null;
  try {
    db = createServiceRoleClient();
  } catch (err) {
    console.warn('[conversations/get] service role client unavailable, using container fallback:', err);
  }

  if (!db) {
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

  try {
    // 1. Fetch all conversations where ctx.userId is a participant (single indexed query)
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

    // 2. Fetch all conversation rows in a single batch query
    const { data: conversationRows, error: cErr } = await db
      .from('marketplace_conversations')
      .select('id, kind, listing_id, company_id, application_id, support_inquiry_id, status, last_message_at, last_message_preview, created_at, updated_at, deleted_at')
      .in('id', conversationIds)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (cErr) throw cErr;

    const validConversations = (conversationRows ?? []) as Array<Record<string, any>>;
    const activeConversationIds = validConversations.map((c) => c.id);

    // 3. Parallel Batch Fetching (0 N+1 queries)
    const [
      allParticipantsRes,
      unreadMessagesRes,
    ] = await Promise.all([
      db
        .from('marketplace_conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', activeConversationIds),
      db
        .from('marketplace_messages')
        .select('conversation_id')
        .in('conversation_id', activeConversationIds)
        .neq('sender_id', ctx.userId)
        .is('read_at', null)
        .is('deleted_at', null),
    ]);

    // Map conversation -> participantUserIds
    const conversationParticipantsMap = new Map<string, string[]>();
    for (const p of (allParticipantsRes.data ?? []) as Array<{ conversation_id: string; user_id: string }>) {
      const list = conversationParticipantsMap.get(p.conversation_id) ?? [];
      list.push(p.user_id);
      conversationParticipantsMap.set(p.conversation_id, list);
    }

    // Collect all otherUserIds
    const otherUserIdsSet = new Set<string>();
    for (const row of validConversations) {
      const pList = conversationParticipantsMap.get(row.id) ?? [];
      const otherId = pList.find((id) => id !== ctx.userId) || pList[0] || ctx.userId;
      if (otherId) otherUserIdsSet.add(otherId);
    }

    // Collect listingIds and companyIds
    const listingIdsSet = new Set<string>();
    const companyIdsSet = new Set<string>();
    for (const row of validConversations) {
      if (row.listing_id) listingIdsSet.add(row.listing_id);
      if (row.company_id) companyIdsSet.add(row.company_id);
    }

    // Batch fetch other participant profiles, listings, companies in parallel
    const [profilesRes, listingsRes, companiesRes] = await Promise.all([
      otherUserIdsSet.size > 0
        ? db
            .from('marketplace_profiles')
            .select('id, user_id, display_name, username, avatar_url, is_verified, investor_verified')
            .in('user_id', Array.from(otherUserIdsSet))
            .is('deleted_at', null)
        : Promise.resolve({ data: [] }),
      listingIdsSet.size > 0
        ? db
            .from('marketplace_listings')
            .select('id, title, slug, company_id')
            .in('id', Array.from(listingIdsSet))
            .is('deleted_at', null)
        : Promise.resolve({ data: [] }),
      companyIdsSet.size > 0
        ? db
            .from('marketplace_companies')
            .select('id, name')
            .in('id', Array.from(companyIdsSet))
            .is('deleted_at', null)
        : Promise.resolve({ data: [] }),
    ]);

    // Build fast lookup Maps
    const profilesMap = new Map<string, any>();
    for (const prof of (profilesRes.data ?? []) as any[]) {
      profilesMap.set(prof.user_id, prof);
    }

    const listingsMap = new Map<string, any>();
    for (const l of (listingsRes.data ?? []) as any[]) {
      listingsMap.set(l.id, l);
      if (l.company_id) companyIdsSet.add(l.company_id);
    }

    const companiesMap = new Map<string, any>();
    for (const comp of (companiesRes.data ?? []) as any[]) {
      companiesMap.set(comp.id, comp);
    }

    // Count unread per conversation
    const unreadCountMap = new Map<string, number>();
    for (const msg of (unreadMessagesRes.data ?? []) as Array<{ conversation_id: string }>) {
      unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) ?? 0) + 1);
    }

    // 4. In-Memory Composition (instant, 0 ms)
    const items: ConversationListItem[] = validConversations.map((row) => {
      const participantUserIds = conversationParticipantsMap.get(row.id) ?? [ctx.userId];
      const otherUserId = participantUserIds.find((id) => id !== ctx.userId) || participantUserIds[0] || ctx.userId;
      const otherProf = profilesMap.get(otherUserId);
      const listingData = row.listing_id ? listingsMap.get(row.listing_id) : null;
      const companyIdToUse = listingData?.company_id || row.company_id;
      const compData = companyIdToUse ? companiesMap.get(companyIdToUse) : null;
      const unreadCount = unreadCountMap.get(row.id) ?? 0;

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
              companyVerified: Boolean(compData?.name),
              companyName: compData?.name ?? null,
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
        listingTitle: kind === 'support' ? 'Girisimbee Destek' : (listingData?.title ?? null),
        listingSlug: listingData?.slug ?? null,
        companyName: kind === 'support' ? 'Destek ekibi' : (compData?.name ?? null),
        unreadCount,
      };
    });

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

