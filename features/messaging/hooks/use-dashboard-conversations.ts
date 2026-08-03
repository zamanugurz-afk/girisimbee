'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import {
  markConversationAsSent,
  readSentConversationIds,
} from '@/features/messaging/lib/messaging-ux-feedback';
import type {
  DashboardMessageCardData,
  DashboardMessagesTab,
} from '@/features/messaging/types/dashboard-messages.types';
import type { ConversationListItem } from '@/features/messaging/types/messaging-view.types';
import { getClientContainer, getMessagingService } from '@/lib/persistence/container';
import type { ConversationId, UserId } from '@/lib/domain/ids';

function mapItem(
  item: ConversationListItem,
  listingHref: string | null,
): DashboardMessageCardData {
  const { conversation, otherParticipant, listingTitle, unreadCount } = item;
  const isUnread = unreadCount > 0;
  return {
    id: conversation.id,
    userName: otherParticipant.displayName,
    username: otherParticipant.username,
    avatarUrl: otherParticipant.avatarUrl,
    subject: listingTitle ?? 'Sohbet',
    lastMessage: conversation.lastMessagePreview ?? 'Henüz mesaj yok',
    date: conversation.lastMessageAt ?? conversation.createdAt,
    isUnread,
    unreadCount,
    readLabel: isUnread
      ? `${unreadCount} okunmamış`
      : conversation.lastMessagePreview
        ? 'Okundu'
        : 'Yeni sohbet',
    listingTitle,
    listingHref,
    otherUserId: otherParticipant.userId,
    status: conversation.status,
  };
}

async function enrichListingHrefs(
  items: ConversationListItem[],
): Promise<Map<string, string | null>> {
  const { listingRepository } = getClientContainer();
  const map = new Map<string, string | null>();
  await Promise.all(
    items.map(async (item) => {
      const listingId = item.conversation.listingId;
      if (!listingId) {
        map.set(item.conversation.id, null);
        return;
      }
      try {
        const listing = await listingRepository.findById(listingId);
        map.set(
          item.conversation.id,
          listing?.slug ? `/ilan/${listing.slug}` : null,
        );
      } catch {
        map.set(item.conversation.id, null);
      }
    }),
  );
  return map;
}

async function loadArchivedItems(userId: UserId): Promise<ConversationListItem[]> {
  const { conversationRepository, messagingService } = getClientContainer();
  const result = await conversationRepository.paginate(
    { participantId: userId, status: 'archived' },
    { page: 1, limit: 50 },
  );

  const items: ConversationListItem[] = [];
  for (const conversation of result.data) {
    const meta = await messagingService.getThreadMeta(conversation.id, userId);
    if (!meta) {
      items.push({
        conversation,
        otherParticipant: {
          userId: conversation.participantIds.find((id) => id !== userId) ?? ('' as UserId),
          displayName: 'Kullanıcı',
          avatarUrl: null,
          username: null,
          companyName: null,
          userVerified: false,
          investorVerified: false,
          companyVerified: false,
        },
        listingTitle: null,
        companyName: null,
        unreadCount: 0,
      });
      continue;
    }
    items.push({
      conversation,
      otherParticipant: meta.otherParticipant,
      listingTitle: meta.listingTitle,
      companyName: meta.companyName,
      unreadCount: 0,
    });
  }
  return items;
}

export function useDashboardConversations() {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const service = useMemo(() => getMessagingService(), []);

  const [inboxItems, setInboxItems] = useState<DashboardMessageCardData[]>([]);
  const [archiveItems, setArchiveItems] = useState<DashboardMessageCardData[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [openResult, archived] = await Promise.all([
        service.listConversationItems(userId, { page: 1, limit: 50 }),
        loadArchivedItems(userId),
      ]);

      const openHrefs = await enrichListingHrefs(openResult.data);
      const archiveHrefs = await enrichListingHrefs(archived);

      setInboxItems(
        openResult.data.map((item) =>
          mapItem(item, openHrefs.get(item.conversation.id) ?? null),
        ),
      );
      setArchiveItems(
        archived.map((item) =>
          mapItem(item, archiveHrefs.get(item.conversation.id) ?? null),
        ),
      );
      setSentIds(readSentConversationIds());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mesajlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [userId, service]);

  useEffect(() => {
    if (userId) void refresh();
  }, [userId, refresh]);

  const itemsForTab = useCallback(
    (tab: DashboardMessagesTab): DashboardMessageCardData[] => {
      if (tab === 'archive') return archiveItems;
      if (tab === 'sent') {
        const fromSent = inboxItems.filter((item) => sentIds.includes(item.id));
        return fromSent.length > 0 ? fromSent : inboxItems.filter((item) => !item.isUnread);
      }
      return inboxItems;
    },
    [inboxItems, archiveItems, sentIds],
  );

  const archiveConversation = useCallback(
    async (conversationId: string) => {
      if (!userId || busyId) return;
      setBusyId(conversationId);
      try {
        await service.archive(
          conversationId as ConversationId,
          userId,
        );
        setInboxItems((prev) => {
          const moved = prev.find((item) => item.id === conversationId);
          if (moved) {
            setArchiveItems((arch) => [
              { ...moved, status: 'archived', isUnread: false, unreadCount: 0, readLabel: 'Arşivlendi' },
              ...arch.filter((item) => item.id !== conversationId),
            ]);
          }
          return prev.filter((item) => item.id !== conversationId);
        });
        toast.success('Konuşma arşive taşındı');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Arşivlenemedi');
      } finally {
        setBusyId(null);
      }
    },
    [userId, busyId, service],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!userId || busyId) return;
      setBusyId(conversationId);
      try {
        const { conversationRepository } = getClientContainer();
        await conversationRepository.softDelete(conversationId as ConversationId);
        setInboxItems((prev) => prev.filter((item) => item.id !== conversationId));
        setArchiveItems((prev) => prev.filter((item) => item.id !== conversationId));
        toast.success('Konuşma silindi');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Silinemedi');
      } finally {
        setBusyId(null);
      }
    },
    [userId, busyId],
  );

  const blockUser = useCallback(
    async (conversationId: string) => {
      if (!userId || busyId) return;
      setBusyId(conversationId);
      try {
        const { conversationRepository } = getClientContainer();
        await conversationRepository.update(conversationId as ConversationId, {
          status: 'blocked',
        });
        setInboxItems((prev) => prev.filter((item) => item.id !== conversationId));
        setArchiveItems((prev) => prev.filter((item) => item.id !== conversationId));
        toast.success('Kullanıcı engellendi');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Engellenemedi');
      } finally {
        setBusyId(null);
      }
    },
    [userId, busyId],
  );

  const reportUser = useCallback(
    async (otherUserId: string) => {
      if (!userId) return;
      try {
        const { reportRepository } = getClientContainer();
        await reportRepository.create({
          reporterId: userId,
          entityType: 'user',
          entityId: otherUserId,
          reason: 'harassment',
        });
        toast.success('Bildirim alındı', {
          description: 'İnceleme ekibimiz en kısa sürede değerlendirecek.',
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Bildirim gönderilemedi');
      }
    },
    [userId],
  );

  const markLocalSent = useCallback((conversationId: string) => {
    markConversationAsSent(conversationId);
    setSentIds(readSentConversationIds());
  }, []);

  return {
    userId,
    isLoading,
    error,
    busyId,
    refresh,
    itemsForTab,
    counts: {
      inbox: inboxItems.length,
      sent: (() => {
        const fromSent = inboxItems.filter((item) => sentIds.includes(item.id));
        return fromSent.length > 0
          ? fromSent.length
          : inboxItems.filter((item) => !item.isUnread).length;
      })(),
      archive: archiveItems.length,
    },
    archiveConversation,
    deleteConversation,
    blockUser,
    reportUser,
    markLocalSent,
  };
}
