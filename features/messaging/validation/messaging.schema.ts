import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema } from '@/lib/domain/validation';

export const conversationStatusSchema = z.enum(['open', 'archived', 'blocked', 'deleted']);

export const conversationKindSchema = z.enum(['listing', 'support', 'application']);

export const conversationSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  kind: conversationKindSchema.default('listing'),
  listingId: uuidSchema.nullable(),
  companyId: uuidSchema.nullable(),
  applicationId: uuidSchema.nullable().optional(),
  supportInquiryId: uuidSchema.nullable().optional(),
  status: conversationStatusSchema,
  lastMessageAt: z.string().datetime({ offset: true }).nullable(),
  lastMessagePreview: z.string().max(200).nullable(),
  participantIds: z.array(uuidSchema).min(1).max(10),
});

export const createConversationSchema = z.object({
  participantIds: z.array(uuidSchema).min(1).max(10),
  listingId: uuidSchema.nullable().optional(),
  companyId: uuidSchema.nullable().optional(),
  applicationId: uuidSchema.nullable().optional(),
  kind: conversationKindSchema.optional(),
  initialMessage: z.string().max(5000).optional(),
});

export const messageStatusSchema = z.enum(['sent', 'delivered', 'read', 'deleted']);

export const messageSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  conversationId: uuidSchema,
  senderId: uuidSchema,
  body: z.string().min(1).max(5000),
  status: messageStatusSchema,
  attachmentUrls: z.array(z.string().url()).max(5),
  readAt: z.string().datetime({ offset: true }).nullable(),
  editedAt: z.string().datetime({ offset: true }).nullable(),
});

export const createMessageSchema = z.object({
  conversationId: uuidSchema,
  senderId: uuidSchema,
  body: z.string().min(1).max(5000),
  attachmentUrls: z.array(z.string().url()).max(5).optional(),
});

export type ConversationSchema = z.infer<typeof conversationSchema>;
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
