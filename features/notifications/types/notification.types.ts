/**
 * Notification — in-app and push notification records.
 *
 * Purpose: Inform users of applications, messages, matches, system events.
 * Relations: belongs to User; references polymorphic entity.
 * Lifecycle: pending → delivered → read → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { NotificationId, UserId } from '@/lib/domain/ids';

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'new_message'
  | 'listing_published'
  | 'listing_expired'
  | 'match_suggested'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system';

export type NotificationStatus = 'pending' | 'delivered' | 'read' | 'failed' | 'deleted';

export type NotificationEntityType =
  | 'listing'
  | 'application'
  | 'conversation'
  | 'message'
  | 'user'
  | 'company'
  | 'verification';

export interface Notification extends Timestamps, SoftDeletable {
  id: NotificationId;
  userId: UserId;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  body: string;
  actionUrl: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  readAt: string | null;
  deliveredAt: string | null;
  metadata: Record<string, unknown>;
}

export type CreateNotificationInput = Pick<
  Notification,
  'userId' | 'type' | 'title' | 'body'
> & {
  actionUrl?: string | null;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export type UpdateNotificationInput = Partial<
  Pick<Notification, 'status' | 'readAt' | 'deliveredAt'>
>;

export interface NotificationFilter {
  userId?: UserId;
  type?: NotificationType | NotificationType[];
  status?: NotificationStatus | NotificationStatus[];
  unreadOnly?: boolean;
  includeDeleted?: boolean;
}

export const NOTIFICATION_INDEXES: IndexDefinition[] = [
  { name: 'notifications_user_id_created_at_idx', columns: ['user_id', 'created_at'] },
  { name: 'notifications_user_status_idx', columns: ['user_id', 'status'] },
  { name: 'notifications_entity_idx', columns: ['entity_type', 'entity_id'], where: 'entity_id IS NOT NULL' },
];

export const NOTIFICATION_LIFECYCLE: Record<NotificationStatus, readonly NotificationStatus[]> = {
  pending: ['delivered', 'failed', 'deleted'],
  delivered: ['read', 'deleted'],
  read: ['deleted'],
  failed: ['pending', 'deleted'],
  deleted: [],
};

export const NOTIFICATION_VALIDATION: ValidationRule[] = [
  { field: 'title', rule: 'required|max:200', message: 'Başlık gerekli.' },
  { field: 'body', rule: 'required|max:1000', message: 'İçerik gerekli.' },
];
