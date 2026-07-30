import type { Repository } from '@/lib/domain/repository';
import type { MessageId } from '@/lib/domain/ids';
import type { Message, CreateMessageInput, UpdateMessageInput, MessageFilter } from '@/features/messaging/types/message.types';

export interface MessageRepository
  extends Repository<Message, MessageId, CreateMessageInput, UpdateMessageInput, MessageFilter> {
  findByConversationId(conversationId: Message['conversationId'], pagination?: import('@/lib/domain/pagination').PaginationParams): Promise<import('@/lib/domain/pagination').PaginatedResult<Message>>;
  markAsRead(conversationId: Message['conversationId'], readerId: Message['senderId'], upToMessageId: MessageId): Promise<number>;
  countUnread(conversationId: Message['conversationId'], readerId: Message['senderId']): Promise<number>;
}
