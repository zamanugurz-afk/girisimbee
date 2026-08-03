/**
 * Simple inbox notification — `notifications`
 * (id, user_id, title, description, type, is_read, created_at).
 * Distinct from the richer marketplace_notifications domain entity.
 */
import type { NotificationId, UserId } from '@/lib/domain/ids';

export interface InboxNotification {
  id: NotificationId;
  userId: UserId;
  title: string;
  description: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
