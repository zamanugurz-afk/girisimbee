// Feature: messaging — domain layer
export type {
  Conversation,
  ConversationStatus,
  ConversationParticipant,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilter,
} from '@/features/messaging/types/conversation.types';
export { CONVERSATION_INDEXES, CONVERSATION_LIFECYCLE, CONVERSATION_VALIDATION } from '@/features/messaging/types/conversation.types';

export type {
  Message,
  MessageStatus,
  CreateMessageInput,
  UpdateMessageInput,
  MessageFilter,
} from '@/features/messaging/types/message.types';
export { MESSAGE_INDEXES, MESSAGE_LIFECYCLE, MESSAGE_VALIDATION } from '@/features/messaging/types/message.types';

export type { ConversationRepository } from '@/features/messaging/repositories/conversation.repository';
export type { MessageRepository } from '@/features/messaging/repositories/message.repository';
export type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
export type {
  ConversationListItem,
  ConversationThreadMeta,
  TypingIndicatorState,
  MessageAttachmentDraft,
} from '@/features/messaging/types/messaging-view.types';

export {
  conversationSchema,
  createConversationSchema,
  messageSchema,
  createMessageSchema,
} from '@/features/messaging/validation/messaging.schema';

export { createConversation, createMessage } from '@/features/messaging/factories/messaging.factory';
export {
  generateMockConversation,
  generateMockMessage,
  generateMockConversations,
  generateMockMessages,
} from '@/features/messaging/mock/messaging.generator';
