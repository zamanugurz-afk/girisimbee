import type { ConversationId, ListingId, UserId } from '@/lib/domain/ids';
import type { Conversation, CreateConversationInput } from '@/features/messaging/types/conversation.types';
import type { Message, CreateMessageInput } from '@/features/messaging/types/message.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { ConversationListItem, ConversationThreadMeta } from '@/features/messaging/types/messaging-view.types';

export interface IMessagingService {
  startConversation(input: CreateConversationInput): Promise<Conversation>;
  getConversation(id: ConversationId, userId: UserId): Promise<Conversation | null>;
  listConversations(userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>>;
  listConversationItems(userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<ConversationListItem>>;
  getThreadMeta(conversationId: ConversationId, userId: UserId): Promise<ConversationThreadMeta | null>;
  sendMessage(input: CreateMessageInput): Promise<Message>;
  getMessages(conversationId: ConversationId, userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Message>>;
  markAsRead(conversationId: ConversationId, userId: UserId): Promise<void>;
  archive(conversationId: ConversationId, userId: UserId): Promise<Conversation>;
  getOrCreateForListing(listingId: ListingId, ownerId: UserId, applicantId: UserId): Promise<Conversation>;
  getUnreadCount(userId: UserId): Promise<number>;
}
