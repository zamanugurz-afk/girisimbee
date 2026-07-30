import type { Repository } from '@/lib/domain/repository';
import type { NotificationId } from '@/lib/domain/ids';
import type { Notification, CreateNotificationInput, UpdateNotificationInput, NotificationFilter } from '@/features/notifications/types/notification.types';

export interface NotificationRepository
  extends Repository<Notification, NotificationId, CreateNotificationInput, UpdateNotificationInput, NotificationFilter> {
  countUnread(userId: Notification['userId']): Promise<number>;
  markAllAsRead(userId: Notification['userId']): Promise<number>;
  markAsRead(id: NotificationId): Promise<Notification>;
}
