import { ids } from '@/lib/domain/ids';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';

export interface InboxNotificationRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

/** marketplace_notifications row subset used as fallback */
export interface MarketplaceNotificationFallbackRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  read_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export function mapInboxNotificationRow(row: InboxNotificationRow): InboxNotification {
  return {
    id: ids.notification(row.id),
    userId: ids.user(row.user_id),
    title: row.title,
    description: row.description,
    type: row.type,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export function mapMarketplaceNotificationFallback(
  row: MarketplaceNotificationFallbackRow,
): InboxNotification {
  return {
    id: ids.notification(row.id),
    userId: ids.user(row.user_id),
    title: row.title,
    description: row.body,
    type: row.type,
    isRead: row.status === 'read' || Boolean(row.read_at),
    createdAt: row.created_at,
  };
}
