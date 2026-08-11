'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/authentication/hooks/use-auth';

/**
 * Polls owner inbox for pending contact-request count (avatar blink indicator).
 */
export function usePendingContactRequestCount(pollMs = 45_000): number {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch('/api/contact-requests', { credentials: 'same-origin' });
      if (!res.ok) {
        setCount(0);
        return;
      }
      const json = (await res.json()) as {
        data?: { requests?: { effectiveStatus?: string }[] };
      };
      const pending = (json.data?.requests ?? []).filter(
        (r) => r.effectiveStatus === 'pending',
      ).length;
      setCount(pending);
    } catch {
      setCount(0);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    void refresh();
    if (!isAuthenticated) return;
    const id = window.setInterval(() => void refresh(), pollMs);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('girisimbee:contact-requests-changed', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('girisimbee:contact-requests-changed', onFocus);
    };
  }, [refresh, isAuthenticated, pollMs]);

  return count;
}

export function notifyContactRequestsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('girisimbee:contact-requests-changed'));
}
