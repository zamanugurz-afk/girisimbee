// Feature: notifications — domain layer
export type {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationEntityType,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationFilter,
} from '@/features/notifications/types/notification.types';
export { NOTIFICATION_INDEXES, NOTIFICATION_LIFECYCLE, NOTIFICATION_VALIDATION } from '@/features/notifications/types/notification.types';

export type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
export type { INotificationService } from '@/features/notifications/services/notification.service.interface';
export { NotificationService } from '@/features/notifications/services/notification.service';
export { getNotificationService } from '@/lib/persistence/container';
export * from '@/features/notifications/repository';

export {
  notificationSchema,
  createNotificationSchema,
} from '@/features/notifications/validation/notification.schema';

export { createNotification, createNotificationInput } from '@/features/notifications/factories/notification.factory';
export { generateMockNotification, generateMockNotifications } from '@/features/notifications/mock/notification.generator';
