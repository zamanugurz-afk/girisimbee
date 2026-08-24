/**
 * Conversation — message thread between marketplace participants.
 *
 * Purpose: Enable free communication around listings or direct outreach.
 * Relations: optional Listing; 2+ participants (User); has many Messages.
 * Lifecycle: open ↔ archived → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { ConversationId, ListingId, UserId, MessageId, CompanyId, ApplicationId } from '@/lib/domain/ids';

export type ConversationStatus = 'open' | 'archived' | 'blocked' | 'deleted';

export type ConversationKind = 'listing' | 'support' | 'application';

export interface ConversationParticipant {
  conversationId: ConversationId;
  userId: UserId;
  joinedAt: string;
  lastReadMessageId: MessageId | null;
  lastReadAt: string | null;
  isMuted: boolean;
}

export interface Conversation extends Timestamps, SoftDeletable {
  id: ConversationId;
  kind: ConversationKind;
  listingId: ListingId | null;
  companyId: CompanyId | null;
  applicationId?: ApplicationId | null;
  supportInquiryId: string | null;
  status: ConversationStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  participantIds: UserId[];
}

export type CreateConversationInput = {
  participantIds: UserId[];
  listingId: ListingId;
  companyId?: CompanyId | null;
  applicationId?: ApplicationId | null;
  kind?: ConversationKind;
  initialMessage?: string;
};

export type UpdateConversationInput = Partial<
  Pick<Conversation, 'status' | 'lastMessageAt' | 'lastMessagePreview'>
>;

export interface ConversationFilter {
  participantId?: UserId;
  listingId?: ListingId;
  status?: ConversationStatus | ConversationStatus[];
  includeDeleted?: boolean;
}

export const CONVERSATION_INDEXES: IndexDefinition[] = [
  { name: 'conversations_listing_id_idx', columns: ['listing_id'], where: 'listing_id IS NOT NULL' },
  { name: 'conversations_last_message_at_idx', columns: ['last_message_at'] },
  { name: 'conversations_status_idx', columns: ['status'] },
  { name: 'conversation_participants_user_id_idx', columns: ['user_id'] },
  { name: 'conversation_participants_conversation_id_idx', columns: ['conversation_id'] },
];

export const CONVERSATION_LIFECYCLE: Record<ConversationStatus, readonly ConversationStatus[]> = {
  open: ['archived', 'blocked', 'deleted'],
  archived: ['open', 'deleted'],
  blocked: ['deleted'],
  deleted: [],
};

export const CONVERSATION_VALIDATION: ValidationRule[] = [
  { field: 'participantIds', rule: 'required|array|min:2|max:10', message: 'En az 2 katılımcı gerekli.' },
];
