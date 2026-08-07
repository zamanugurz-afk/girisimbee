/**
 * Client-only messaging UX feedback (toast + local inbox preview).
 * Does not change messaging/notification APIs.
 */
import { toast } from 'sonner';
import type { AccountNotificationCardData } from '@/features/account/types/account-notifications.types';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { normalizeLocalNotificationCard } from '@/features/account/lib/map-inbox-notification-to-card';

const STORAGE_KEY = 'Girisimbee.message-ux-notifications';
const SENT_KEY = 'Girisimbee.message-sent-conversation-ids';
const MAX_LOCAL = 20;

export function pushConversationStartedFeedback(input: {
  conversationId: string;
  listingTitle?: string;
}) {
  const title = input.listingTitle?.trim() || 'İlan';
  const href = `${DASHBOARD_ROUTES.mesajlarim}?c=${input.conversationId}`;
  const notification = normalizeLocalNotificationCard({
    id: `local-msg-${input.conversationId}-${Date.now()}`,
    title: 'Bir kullanıcı size mesaj gönderdi.',
    description: `"${title}" için sohbet oluşturuldu.`,
    createdAt: new Date().toISOString(),
    status: 'unread',
    type: 'messages',
    iconKey: 'message',
    actionHref: href,
    actionLabel: 'Mesajlara git',
    source: 'local',
    eventKey: 'new_message',
  });

  try {
    const existing = readLocalMessageNotifications();
    const next = [notification, ...existing].slice(0, MAX_LOCAL);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('Girisimbee:message-notification'));
  } catch {
    // ignore
  }

  markConversationAsSent(input.conversationId);

  toast.success('Sohbet oluşturuldu', {
    description: 'Mesajlarınız panelde görünecek.',
    action: {
      label: 'Mesajlarım',
      onClick: () => {
        window.location.href = href;
      },
    },
  });
}

export function pushMessageSentFeedback() {
  toast.success('Mesaj gönderildi');
}

export function readLocalMessageNotifications(): AccountNotificationCardData[] {
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
          type: 'messages',
          source: 'local',
        }),
      );
  } catch {
    return [];
  }
}

export function markLocalMessageNotificationRead(id: string) {
  try {
    const next = readLocalMessageNotifications().map((item) =>
      item.id === id ? { ...item, status: 'read' as const } : item,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function markConversationAsSent(conversationId: string) {
  try {
    const ids = readSentConversationIds();
    if (!ids.includes(conversationId)) {
      window.localStorage.setItem(SENT_KEY, JSON.stringify([conversationId, ...ids].slice(0, 100)));
    }
  } catch {
    // ignore
  }
}

export function readSentConversationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
