/**
 * Message — individual message within a conversation.
 *
 * Purpose: Deliver communication content; support read receipts.
 * Relations: belongs to Conversation and User (sender).
 * Lifecycle: sent → delivered → read → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { MessageId, ConversationId, UserId } from '@/lib/domain/ids';

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'deleted';

export interface Message extends Timestamps, SoftDeletable {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  body: string;
  status: MessageStatus;
  attachmentUrls: string[];
  readAt: string | null;
  editedAt: string | null;
}

export type CreateMessageInput = Pick<Message, 'conversationId' | 'senderId' | 'body'> & {
  attachmentUrls?: string[];
};

export type UpdateMessageInput = Partial<Pick<Message, 'body' | 'status' | 'readAt' | 'editedAt'>>;

export interface MessageFilter {
  conversationId?: ConversationId;
  senderId?: UserId;
  status?: MessageStatus | MessageStatus[];
  after?: string;
  before?: string;
  includeDeleted?: boolean;
}

export const MESSAGE_INDEXES: IndexDefinition[] = [
  { name: 'messages_conversation_id_created_at_idx', columns: ['conversation_id', 'created_at'] },
  { name: 'messages_sender_id_idx', columns: ['sender_id'] },
  { name: 'messages_status_idx', columns: ['status'] },
];

export const MESSAGE_LIFECYCLE: Record<MessageStatus, readonly MessageStatus[]> = {
  sent: ['delivered', 'read', 'deleted'],
  delivered: ['read', 'deleted'],
  read: ['deleted'],
  deleted: [],
};

export const MESSAGE_VALIDATION: ValidationRule[] = [
  { field: 'body', rule: 'required|min:1|max:5000', message: 'Mesaj 1–5000 karakter olmalı.' },
  { field: 'attachmentUrls', rule: 'array|max:5', message: 'En fazla 5 ek.' },
];
