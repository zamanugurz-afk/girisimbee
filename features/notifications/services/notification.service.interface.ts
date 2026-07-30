import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { Notification, CreateNotificationInput, NotificationFilter } from '@/features/notifications/types/notification.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface INotificationService {
  send(input: CreateNotificationInput): Promise<Notification>;
  list(userId: UserId, filter?: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>>;
  getUnreadCount(userId: UserId): Promise<number>;
  markAsRead(id: NotificationId, userId: UserId): Promise<Notification>;
  markAllAsRead(userId: UserId): Promise<number>;
  delete(id: NotificationId, userId: UserId): Promise<void>;
}
