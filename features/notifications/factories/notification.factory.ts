import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Notification, CreateNotificationInput } from '@/features/notifications/types/notification.types';

export function createNotification(
  overrides: Partial<Notification> & Pick<Notification, 'userId' | 'type' | 'title' | 'body'>,
): Notification {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.notification(crypto.randomUUID()),
    userId: overrides.userId,
    type: overrides.type,
    status: overrides.status ?? 'pending',
    title: overrides.title,
    body: overrides.body,
    actionUrl: overrides.actionUrl ?? null,
    entityType: overrides.entityType ?? null,
    entityId: overrides.entityId ?? null,
    readAt: overrides.readAt ?? null,
    deliveredAt: overrides.deliveredAt ?? null,
    metadata: overrides.metadata ?? {},
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createNotificationInput(overrides: Partial<CreateNotificationInput> = {}): CreateNotificationInput {
  return {
    userId: overrides.userId ?? ids.user(crypto.randomUUID()),
    type: overrides.type ?? 'system',
    title: overrides.title ?? 'Bildirim',
    body: overrides.body ?? 'Yeni bir bildiriminiz var.',
    actionUrl: overrides.actionUrl,
    entityType: overrides.entityType,
    entityId: overrides.entityId,
    metadata: overrides.metadata,
  };
}
