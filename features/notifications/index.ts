// Feature: notifications — domain layer
export type {
  Notification,
  NotificationStatus,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationFilter,
} from '@/features/notifications/types/notification.types';
export { NOTIFICATION_INDEXES, NOTIFICATION_LIFECYCLE, NOTIFICATION_VALIDATION } from '@/features/notifications/types/notification.types';

export type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';

export type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
export type { InboxNotificationRepository } from '@/features/notifications/repositories/inbox-notification.repository';
export type { INotificationService } from '@/features/notifications/services/notification.service.interface';
export { NotificationService } from '@/features/notifications/services/notification.service';
export { InboxNotificationService } from '@/features/notifications/services/inbox-notification.service';
export { getNotificationService, getInboxNotificationService } from '@/lib/persistence/container';
export * from '@/features/notifications/repository';

export {
  notificationSchema,
  createNotificationSchema,
} from '@/features/notifications/validation/notification.schema';

export { createNotification, createNotificationInput } from '@/features/notifications/factories/notification.factory';
export { generateMockNotification, generateMockNotifications } from '@/features/notifications/mock/notification.generator';
