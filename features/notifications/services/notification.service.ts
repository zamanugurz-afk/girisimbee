import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { Notification, CreateNotificationInput, NotificationFilter } from '@/features/notifications/types/notification.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';
import type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
import { NotFoundError, ForbiddenError } from '@/lib/domain/errors';

export class NotificationService implements INotificationService {
  constructor(private repo: NotificationRepository) {}

  send(input: CreateNotificationInput): Promise<Notification> {
    return this.repo.create(input);
  }

  list(userId: UserId, filter?: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    return this.repo.paginate({ ...filter, userId }, pagination);
  }

  getUnreadCount(userId: UserId): Promise<number> {
    return this.repo.countUnread(userId);
  }

  async markAsRead(id: NotificationId, userId: UserId): Promise<Notification> {
    const notification = await this.repo.findById(id);
    if (!notification) throw new NotFoundError('Notification', id);
    if (notification.userId !== userId) throw new ForbiddenError('Not your notification');
    return this.repo.markAsRead(id);
  }

  markAllAsRead(userId: UserId): Promise<number> {
    return this.repo.markAllAsRead(userId);
  }

  async delete(id: NotificationId, userId: UserId): Promise<void> {
    const notification = await this.repo.findById(id);
    if (!notification) throw new NotFoundError('Notification', id);
    if (notification.userId !== userId) throw new ForbiddenError('Not your notification');
    await this.repo.delete(id);
  }
}
