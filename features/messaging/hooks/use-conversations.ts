'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMessagingService } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import type { ConversationListItem } from '@/features/messaging/types/messaging-view.types';
import { useAuth } from '@/features/authentication/hooks/use-auth';

const PAGE_SIZE = 20;

export function useConversations() {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const service = useMemo(() => getMessagingService(), []);

  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pageNum: number, append = false) => {
      if (!userId) return;
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);
      try {
        const result = await service.listConversationItems(userId, { page: pageNum, limit: PAGE_SIZE });
        setItems((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Konuşmalar yüklenemedi');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId, service],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    load(page + 1, true);
  }, [hasMore, isLoadingMore, isLoading, page, load]);

  useEffect(() => {
    if (userId) load(1);
  }, [userId, load]);

  return {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh: () => load(1),
  };
}
