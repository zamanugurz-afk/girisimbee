import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, metadataSchema } from '@/lib/domain/validation';

export const reportReasonSchema = z.enum([
  'spam', 'fraud', 'harassment', 'misleading', 'inappropriate', 'duplicate', 'other',
]);
export const reportEntityTypeSchema = z.enum(['listing', 'user', 'company', 'message', 'profile']);
export const reportStatusSchema = z.enum(['submitted', 'in_review', 'resolved', 'dismissed', 'deleted']);

export const reportSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  reporterId: uuidSchema,
  entityType: reportEntityTypeSchema,
  entityId: uuidSchema,
  reason: reportReasonSchema,
  description: z.string().max(2000).nullable(),
  status: reportStatusSchema,
  reviewerId: uuidSchema.nullable(),
  reviewedAt: z.string().datetime({ offset: true }).nullable(),
  resolution: z.string().max(2000).nullable(),
});

export const createReportSchema = z.object({
  reporterId: uuidSchema,
  entityType: reportEntityTypeSchema,
  entityId: uuidSchema,
  reason: reportReasonSchema,
  description: z.string().max(2000).nullable().optional(),
});

export const activityVerbSchema = z.enum([
  'listing.created', 'listing.published', 'listing.viewed',
  'application.submitted', 'application.accepted', 'message.sent',
  'user.registered', 'user.verified', 'company.created', 'favorite.added', 'match.created',
]);
export const activityEntityTypeSchema = z.enum([
  'listing', 'application', 'user', 'company', 'conversation', 'favorite',
]);

export const activitySchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  actorId: uuidSchema.nullable(),
  verb: activityVerbSchema,
  entityType: activityEntityTypeSchema,
  entityId: uuidSchema,
  summary: z.string().max(500),
  metadata: metadataSchema,
  isPublic: z.boolean(),
});

export const createActivitySchema = z.object({
  verb: activityVerbSchema,
  entityType: activityEntityTypeSchema,
  entityId: uuidSchema,
  summary: z.string().max(500),
  actorId: uuidSchema.nullable().optional(),
  metadata: metadataSchema.optional(),
  isPublic: z.boolean().optional(),
});

export const subscriptionPlanSchema = z.enum(['free', 'pro', 'business']);
export const subscriptionStatusSchema = z.enum(['trialing', 'active', 'past_due', 'canceled', 'expired', 'deleted']);

export const subscriptionSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  userId: uuidSchema,
  plan: subscriptionPlanSchema,
  status: subscriptionStatusSchema,
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  currentPeriodStart: z.string().datetime({ offset: true }).nullable(),
  currentPeriodEnd: z.string().datetime({ offset: true }).nullable(),
  canceledAt: z.string().datetime({ offset: true }).nullable(),
  trialEnd: z.string().datetime({ offset: true }).nullable(),
});

export type ReportSchema = z.infer<typeof reportSchema>;
export type ActivitySchema = z.infer<typeof activitySchema>;
export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
