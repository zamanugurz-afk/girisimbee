import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { InboxNotificationRepository } from '@/features/notifications/repositories/inbox-notification.repository';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';

export class MockInboxNotificationRepository implements InboxNotificationRepository {
  private rows: InboxNotification[] = [];

  async listByUser(userId: UserId): Promise<InboxNotification[]> {
    return this.rows
      .filter((row) => row.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markAsRead(id: NotificationId, userId: UserId): Promise<InboxNotification> {
    const row = this.rows.find((item) => item.id === id && item.userId === userId);
    if (!row) throw new Error('Bildirim bulunamadı.');
    row.isRead = true;
    return row;
  }

  async markAllAsRead(userId: UserId): Promise<number> {
    let count = 0;
    for (const row of this.rows) {
      if (row.userId === userId && !row.isRead) {
        row.isRead = true;
        count += 1;
      }
    }
    return count;
  }

  async delete(id: NotificationId, userId: UserId): Promise<void> {
    this.rows = this.rows.filter(
      (row) => !(row.id === id && row.userId === userId),
    );
  }

  async clearByUser(userId: UserId): Promise<number> {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.userId !== userId);
    return before - this.rows.length;
  }
}
