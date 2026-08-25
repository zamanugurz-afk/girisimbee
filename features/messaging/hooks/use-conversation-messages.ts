'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMessagingService } from '@/lib/persistence/container';
import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';
import type { ConversationId, UserId, MessageId } from '@/lib/domain/ids';
import type { Message } from '@/features/messaging/types/message.types';
import type { ConversationThreadMeta } from '@/features/messaging/types/messaging-view.types';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { ids } from '@/lib/domain/ids';
import { notifyUnreadMessagesChanged } from '@/features/messaging/hooks/use-unread-message-count';

const PAGE_SIZE = 30;

export function useConversationMessages(conversationId: ConversationId) {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const service = useMemo(() => getMessagingService(), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<ConversationThreadMeta | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef(new Set<string>());

  const loadMeta = useCallback(async () => {
    if (!userId) return;
    const threadMeta = await service.getThreadMeta(conversationId, userId);
    setMeta(threadMeta);
  }, [conversationId, userId, service]);

  const loadMessages = useCallback(
    async (pageNum: number, prepend = false) => {
      if (!userId) return;
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);
      try {
        const result = await service.getMessages(conversationId, userId, {
          page: pageNum,
          limit: PAGE_SIZE,
        });
        const chronological = [...result.data].reverse();
        for (const m of chronological) seenIds.current.add(m.id);
        setMessages((prev) => {
          if (prepend) {
            const merged = [...chronological, ...prev];
            const unique = merged.filter(
              (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i,
            );
            return unique;
          }
          return chronological;
        });
        setHasMore(result.hasMore);
        setPage(pageNum);
        if (pageNum === 1) {
          await service.markAsRead(conversationId, userId);
          notifyUnreadMessagesChanged();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Mesajlar yüklenemedi');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [conversationId, userId, service],
  );

  const loadOlder = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    loadMessages(page + 1, true);
  }, [hasMore, isLoadingMore, isLoading, page, loadMessages]);

  const sendMessage = useCallback(
    async (body: string, attachmentUrls: string[] = []) => {
      if (!userId || !body.trim()) return null;
      setIsSending(true);
      setError(null);
      try {
        const message = await service.sendMessage({
          conversationId,
          senderId: userId,
          body: body.trim(),
          attachmentUrls,
        });
        seenIds.current.add(message.id);
        setMessages((prev) => [...prev, message]);
        await service.markAsRead(conversationId, userId);
        notifyUnreadMessagesChanged();
        return message;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Mesaj gönderilemedi');
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, userId, service],
  );

  const appendIncoming = useCallback((message: Message) => {
    if (seenIds.current.has(message.id)) return;
    seenIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadMeta();
    loadMessages(1);
  }, [userId, loadMeta, loadMessages]);

  useEffect(() => {
    if (resolvePersistenceDriver() !== 'supabase' || !userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const message: Message = {
            id: row.id as MessageId,
            conversationId: row.conversation_id as ConversationId,
            senderId: row.sender_id as UserId,
            body: row.body as string,
            status: row.status as Message['status'],
            attachmentUrls: (row.attachment_urls as string[]) ?? [],
            readAt: (row.read_at as string | null) ?? null,
            editedAt: (row.edited_at as string | null) ?? null,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
            deletedAt: (row.deleted_at as string | null) ?? null,
          };
          appendIncoming(message);
          if (message.senderId !== userId) {
            service
              .markAsRead(conversationId, userId)
              .then(() => notifyUnreadMessagesChanged())
              .catch(() => undefined);
          } else {
            notifyUnreadMessagesChanged();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, appendIncoming, service]);

  const refreshMessages = useCallback(() => {
    return loadMessages(1);
  }, [loadMessages]);

  return {
    messages,
    meta,
    isLoading,
    isLoadingMore,
    isSending,
    hasMore,
    error,
    loadOlder,
    sendMessage,
    refreshMessages,
    userId,
  };
}

export function useStartConversation() {
  const { user } = useAuth();
  const service = useMemo(() => getMessagingService(), []);
  const [isStarting, setIsStarting] = useState(false);

  const start = useCallback(
    async (listingId: string, ownerId: string) => {
      if (!user) return null;
      setIsStarting(true);
      try {
        const conversation = await service.getOrCreateForListing(
          ids.listing(listingId),
          ids.user(ownerId),
          ids.user(user.id),
        );
        return conversation.id;
      } finally {
        setIsStarting(false);
      }
    },
    [user, service],
  );

  return { start, isStarting, isAuthenticated: !!user };
}
