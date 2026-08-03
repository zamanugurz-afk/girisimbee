import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { InboxNotificationRepository } from '@/features/notifications/repositories/inbox-notification.repository';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';

/**
 * Account panel notifications API over `notifications`.
 * Method names match ACCOUNT INTEGRATION – STEP 3 contract.
 */
export class InboxNotificationService {
  constructor(private readonly repo: InboxNotificationRepository) {}

  getNotifications(userId: UserId): Promise<InboxNotification[]> {
    return this.repo.listByUser(userId);
  }

  markAsRead(id: NotificationId, userId: UserId): Promise<InboxNotification> {
    return this.repo.markAsRead(id, userId);
  }

  markAllAsRead(userId: UserId): Promise<number> {
    return this.repo.markAllAsRead(userId);
  }

  deleteNotification(id: NotificationId, userId: UserId): Promise<void> {
    return this.repo.delete(id, userId);
  }

  clearNotifications(userId: UserId): Promise<number> {
    return this.repo.clearByUser(userId);
  }
}
