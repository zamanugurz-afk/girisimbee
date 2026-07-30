import type { Repository } from '@/lib/domain/repository';
import type { ConversationId, UserId, MessageId } from '@/lib/domain/ids';
import type { Conversation, ConversationParticipant, CreateConversationInput, UpdateConversationInput, ConversationFilter } from '@/features/messaging/types/conversation.types';

export interface ConversationRepository
  extends Repository<Conversation, ConversationId, CreateConversationInput, UpdateConversationInput, ConversationFilter> {
  findByParticipants(participantIds: Conversation['participantIds']): Promise<Conversation | null>;
  findByListingAndParticipants(listingId: Conversation['listingId'], participantIds: Conversation['participantIds']): Promise<Conversation | null>;
  updateLastMessage(id: ConversationId, preview: string, at: string): Promise<void>;
  getParticipants(conversationId: ConversationId): Promise<ConversationParticipant[]>;
  addParticipants(conversationId: ConversationId, userIds: UserId[]): Promise<void>;
  updateParticipantRead(conversationId: ConversationId, userId: UserId, messageId: MessageId, readAt: string): Promise<void>;
  countUnreadForUser(userId: UserId): Promise<number>;
}
