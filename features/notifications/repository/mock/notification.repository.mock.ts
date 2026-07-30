/**
 * Mock notification repository — in-memory notification store.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { Notification, CreateNotificationInput, UpdateNotificationInput, NotificationFilter } from '@/features/notifications/types/notification.types';
import type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createNotification } from '@/features/notifications/factories/notification.factory';

export class MockNotificationRepository implements NotificationRepository {
  private notifications = new Map<NotificationId, Notification>();

  async findById(id: NotificationId, filter?: RepositoryFilter): Promise<Notification | null> {
    const n = this.notifications.get(id);
    if (!n) return null;
    if (!filter?.includeDeleted && n.deletedAt) return null;
    return n;
  }

  async findMany(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.notifications.values()];
    if (!filter.includeDeleted) results = results.filter((n) => !n.deletedAt);
    if (filter.userId) results = results.filter((n) => n.userId === filter.userId);
    if (filter.unreadOnly) results = results.filter((n) => n.status !== 'read');
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      results = results.filter((n) => types.includes(n.type));
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((n) => statuses.includes(n.status));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: NotificationFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async countUnread(userId: UserId): Promise<number> {
    return this.count({ userId, unreadOnly: true });
  }

  async exists(id: NotificationId): Promise<boolean> {
    return this.notifications.has(id);
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = createNotification(input);
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async update(id: NotificationId, input: UpdateNotificationInput): Promise<Notification> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Notification', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.notifications.set(id, updated);
    return updated;
  }

  async softDelete(id: NotificationId): Promise<void> {
    const n = await this.findById(id);
    if (!n) throw new NotFoundError('Notification', id);
    this.notifications.set(id, { ...n, status: 'deleted', deletedAt: now(), updatedAt: now() });
  }

  async delete(id: NotificationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: NotificationId): Promise<Notification> {
    const n = await this.findById(id, { includeDeleted: true });
    if (!n) throw new NotFoundError('Notification', id);
    const updated = { ...n, status: 'delivered' as Notification['status'], deletedAt: null, updatedAt: now() };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllAsRead(userId: UserId): Promise<number> {
    let count = 0;
    for (const [id, n] of this.notifications) {
      if (n.userId === userId && n.status !== 'read' && !n.deletedAt) {
        this.notifications.set(id, { ...n, status: 'read', readAt: now(), updatedAt: now() });
        count += 1;
      }
    }
    return count;
  }

  async markAsRead(id: NotificationId): Promise<Notification> {
    return this.update(id, { status: 'read', readAt: now() });
  }
}

export const mockNotificationRepository = new MockNotificationRepository();
