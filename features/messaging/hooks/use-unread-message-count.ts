'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getMessagingService } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import { useAuth } from '@/features/authentication/hooks/use-auth';

const unreadCountCache = new Map<string, number>();
const POLL_INTERVAL_MS = 60_000;
const IDLE_DEFER_MS = 3_000;

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

    const schedulePoll = () => {
      cancelIdle = scheduleIdleWork(() => {
        if (!cancelled && document.visibilityState === 'visible') {
          void refresh.current();
        }
      });
    };

    const startPolling = () => {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(schedulePoll, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      cancelIdle();
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [userId]);

  return {
    count,
    refresh: () => refresh.current(),
  };
}
