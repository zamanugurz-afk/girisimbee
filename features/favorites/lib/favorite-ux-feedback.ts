/**
 * Client-only favorite UX feedback (toast + local inbox preview).
 * Does not call notification APIs or change persistence.
 */
import { toast } from 'sonner';
import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { normalizeLocalNotificationCard } from '@/features/account/lib/map-inbox-notification-to-card';

const STORAGE_KEY = 'girisimco.favorite-ux-notifications';
const MAX_LOCAL = 20;

export function pushFavoriteAddedFeedback(input: {
  listingId: string;
  title?: string;
}) {
  const title = input.title?.trim() || 'İlan';
  const notification = normalizeLocalNotificationCard({
    id: `local-fav-${input.listingId}-${Date.now()}`,
    title: 'Favorilere eklendi',
    description: `"${title}" favori listenize kaydedildi.`,
    createdAt: new Date().toISOString(),
    status: 'unread',
    type: 'favorites',
    iconKey: 'heart',
    actionHref: DASHBOARD_ROUTES.favorilerim,
    actionLabel: 'Favorilerime git',
    source: 'local',
    eventKey: 'listing_favorited',
  });

  try {
    const existing = readLocalFavoriteNotifications();
    const next = [
      notification,
      ...existing.filter((item) => !item.id.includes(input.listingId)),
    ].slice(0, MAX_LOCAL);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('girisimco:favorite-notification'));
  } catch {
    // ignore storage failures
  }

  toast.success('Favorilere eklendi', {
    description: 'Favorilerim sayfasından tekrar ulaşabilirsiniz.',
    action: {
      label: 'Favorilerim',
      onClick: () => {
        window.location.href = DASHBOARD_ROUTES.favorilerim;
      },
    },
  });
}

export function pushFavoriteRemovedFeedback() {
  toast.message('Favorilerden kaldırıldı');
}

export function readLocalFavoriteNotifications(): AccountNotificationCardData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AccountNotificationCardData[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string')
      .map((item) =>
        normalizeLocalNotificationCard({
          ...item,
          type: 'favorites',
          source: 'local',
        }),
      );
  } catch {
    return [];
  }
}

export function markLocalFavoriteNotificationRead(id: string) {
  try {
    const next = readLocalFavoriteNotifications().map((item) =>
      item.id === id ? { ...item, status: 'read' as const } : item,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearLocalFavoriteNotifications() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
