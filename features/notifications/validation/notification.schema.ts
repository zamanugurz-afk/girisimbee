import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, metadataSchema } from '@/lib/domain/validation';

export const notificationTypeSchema = z.enum([
  'application_received', 'application_accepted', 'application_rejected',
  'new_message', 'listing_published', 'listing_expired', 'match_suggested',
  'verification_approved', 'verification_rejected', 'system',
]);

export const notificationStatusSchema = z.enum(['pending', 'delivered', 'read', 'failed', 'deleted']);
export const notificationEntityTypeSchema = z.enum([
  'listing', 'application', 'conversation', 'message', 'user', 'company', 'verification',
]);

export const notificationSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  userId: uuidSchema,
  type: notificationTypeSchema,
  status: notificationStatusSchema,
  title: z.string().max(200),
  body: z.string().max(1000),
  actionUrl: z.string().url().nullable(),
  entityType: notificationEntityTypeSchema.nullable(),
  entityId: uuidSchema.nullable(),
  readAt: z.string().datetime({ offset: true }).nullable(),
  deliveredAt: z.string().datetime({ offset: true }).nullable(),
  metadata: metadataSchema,
});

export const createNotificationSchema = z.object({
  userId: uuidSchema,
  type: notificationTypeSchema,
  title: z.string().max(200),
  body: z.string().max(1000),
  actionUrl: z.string().url().nullable().optional(),
  entityType: notificationEntityTypeSchema.nullable().optional(),
  entityId: uuidSchema.nullable().optional(),
  metadata: metadataSchema.optional(),
});

export type NotificationSchema = z.infer<typeof notificationSchema>;
