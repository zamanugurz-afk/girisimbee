import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter } from '@/lib/domain/mock-utils';
import { createNotification } from '@/features/notifications/factories/notification.factory';
import type { Notification, NotificationType } from '@/features/notifications/types/notification.types';
import type { UserId } from '@/lib/domain/ids';

const TYPES: NotificationType[] = [
  'application_received', 'new_message', 'listing_published', 'match_suggested', 'system',
];

const TITLES: Record<NotificationType, string> = {
  application_received: 'Yeni başvuru',
  application_accepted: 'Başvurunuz kabul edildi',
  application_rejected: 'Başvurunuz reddedildi',
  new_message: 'Yeni mesaj',
  listing_published: 'İlanınız yayında',
  listing_expired: 'İlanınızın süresi doldu',
  match_suggested: 'Size uygun bir eşleşme',
  verification_approved: 'Doğrulama onaylandı',
  verification_rejected: 'Doğrulama reddedildi',
  system: 'Sistem bildirimi',
};

export function generateMockNotification(index = 1, userId?: UserId): Notification {
  const type = TYPES[index % TYPES.length];
  return createNotification({
    id: ids.notification(mockUuid('h0000001')),
    userId: userId ?? ids.user(mockUuid('a0000001')),
    type,
    title: TITLES[type],
    body: `${TITLES[type]} — detaylar için tıklayın.`,
    status: index % 4 === 0 ? 'read' : 'delivered',
    readAt: index % 4 === 0 ? new Date().toISOString() : null,
    deliveredAt: new Date().toISOString(),
  });
}

export function generateMockNotifications(count: number, userId?: UserId): Notification[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockNotification(i + 1, userId));
}
