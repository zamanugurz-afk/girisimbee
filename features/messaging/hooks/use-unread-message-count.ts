'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/authentication/hooks/use-auth';

const unreadCountCache = new Map<string, number>();
const POLL_INTERVAL_MS = 15_000;
export const UNREAD_MESSAGES_CHANGED_EVENT = 'girisimbee:messages-unread-changed';

function readCachedCount(userId: string | undefined): number {
  if (!userId) return 0;
  return unreadCountCache.get(userId) ?? 0;
}

/** Call after mark-as-read / send so sidebar + header badges refresh immediately. */
export function notifyUnreadMessagesChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(UNREAD_MESSAGES_CHANGED_EVENT));
}

export function useUnreadMessageCount(pollMs = POLL_INTERVAL_MS) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const [count, setCount] = useState(() => readCachedCount(userId));
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const refresh = useCallback(async () => {
    const id = userIdRef.current;
    if (!id || !isAuthenticated) {
      setCount(0);
      return;
    }

    try {
      const res = await fetch('/api/messages/unread-count', { credentials: 'same-origin' });
      if (!res.ok) {
        setCount(readCachedCount(id));
        return;
      }
      const json = (await res.json()) as { data?: { count?: number } };
      const total = typeof json.data?.count === 'number' ? json.data.count : 0;
      unreadCountCache.set(id, total);
      setCount(total);
    } catch {
      setCount(readCachedCount(id));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!userId || !isAuthenticated) {
      setCount(0);
      return;
    }

    setCount(readCachedCount(userId));
    void refresh();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, pollMs);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onFocus = () => void refresh();
    const onUnreadChanged = () => void refresh();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener(UNREAD_MESSAGES_CHANGED_EVENT, onUnreadChanged);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(UNREAD_MESSAGES_CHANGED_EVENT, onUnreadChanged);
    };
  }, [userId, isAuthenticated, pollMs, refresh]);

  return {
    count,
    refresh,
  };
}
