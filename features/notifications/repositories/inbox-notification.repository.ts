import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';

export interface InboxNotificationRepository {
  listByUser(userId: UserId): Promise<InboxNotification[]>;
  markAsRead(id: NotificationId, userId: UserId): Promise<InboxNotification>;
  markAllAsRead(userId: UserId): Promise<number>;
  delete(id: NotificationId, userId: UserId): Promise<void>;
  clearByUser(userId: UserId): Promise<number>;
}
