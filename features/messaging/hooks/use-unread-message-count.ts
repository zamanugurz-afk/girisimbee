'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getMessagingService } from '@/lib/persistence/container';
import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';
import type { UserId } from '@/lib/domain/ids';
import { useAuth } from '@/features/authentication/hooks/use-auth';

const unreadCountCache = new Map<string, number>();
const POLL_INTERVAL_MS = 15_000;
const IDLE_DEFER_MS = 1_200;
const REALTIME_DEBOUNCE_MS = 400;
export const UNREAD_MESSAGES_CHANGED_EVENT = 'girisimbee:messages-unread-changed';

function readCachedCount(userId: string | undefined): number {
  if (!userId) return 0;
  return unreadCountCache.get(userId) ?? 0;
}

function scheduleIdleWork(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: IDLE_DEFER_MS });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 100);
  return () => window.clearTimeout(timeoutId);
}

/** Call after mark-as-read / send so sidebar + header badges refresh immediately. */
export function notifyUnreadMessagesChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UNREAD_MESSAGES_CHANGED_EVENT));
}

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const userId = user?.id as UserId | undefined;
  const service = useMemo(() => getMessagingService(), []);
  const [count, setCount] = useState(() => readCachedCount(userId));
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const refresh = useRef(async () => {
    const id = userIdRef.current;
    if (!id) {
      setCount(0);
      return;
    }

    try {
      const total = await service.getUnreadCount(id);
      unreadCountCache.set(id, total);
      setCount(total);
    } catch {
      setCount(readCachedCount(id));
    }
  });

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    setCount(readCachedCount(userId));

    let cancelled = false;
    let cancelIdle = scheduleIdleWork(() => {
      if (!cancelled) void refresh.current();
    });

    let intervalId: number | undefined;
    let realtimeDebounce: number | undefined;

    const scheduleRefresh = () => {
      cancelIdle();
      cancelIdle = scheduleIdleWork(() => {
        if (!cancelled && document.visibilityState === 'visible') {
          void refresh.current();
        }
      });
    };

    const startPolling = () => {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(scheduleRefresh, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRefresh();
        startPolling();
      } else {
        stopPolling();
      }
    };

    const onFocus = () => scheduleRefresh();
    const onUnreadChanged = () => scheduleRefresh();

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener(UNREAD_MESSAGES_CHANGED_EVENT, onUnreadChanged);

    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
    if (resolvePersistenceDriver() === 'supabase') {
      const supabase = createClient();
      channel = supabase
        .channel(`unread-messages:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'marketplace_messages',
          },
          () => {
            if (realtimeDebounce !== undefined) window.clearTimeout(realtimeDebounce);
            realtimeDebounce = window.setTimeout(() => {
              if (!cancelled) void refresh.current();
            }, REALTIME_DEBOUNCE_MS);
          },
        )
        .subscribe();
    }

    return () => {
      cancelled = true;
      cancelIdle();
      stopPolling();
      if (realtimeDebounce !== undefined) window.clearTimeout(realtimeDebounce);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(UNREAD_MESSAGES_CHANGED_EVENT, onUnreadChanged);
      if (channel) {
        const supabase = createClient();
        void supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return {
    count,
    refresh: () => refresh.current(),
  };
}
