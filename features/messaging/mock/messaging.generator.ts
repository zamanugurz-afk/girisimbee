import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter, loremWords } from '@/lib/domain/mock-utils';
import { createConversation, createMessage } from '@/features/messaging/factories/messaging.factory';
import type { Conversation } from '@/features/messaging/types/conversation.types';
import type { Message } from '@/features/messaging/types/message.types';
import type { ListingId, UserId } from '@/lib/domain/ids';

export function generateMockConversation(index = 1, participants?: [UserId, UserId], listingId?: ListingId): Conversation {
  const p1 = participants?.[0] ?? ids.user(mockUuid('a0000001'));
  const p2 = participants?.[1] ?? ids.user(mockUuid('a0000002'));
  return createConversation({
    id: ids.conversation(mockUuid('f0000001')),
    listingId: listingId ?? (index % 2 === 0 ? ids.listing(mockUuid('d0000001')) : null),
    participantIds: [p1, p2],
    status: 'open',
    lastMessageAt: new Date().toISOString(),
    lastMessagePreview: loremWords(8).slice(0, 100),
  });
}

export function generateMockMessage(index = 1, conversationId?: Conversation['id'], senderId?: UserId): Message {
  return createMessage({
    id: ids.message(mockUuid('f0000002')),
    conversationId: conversationId ?? ids.conversation(mockUuid('f0000001')),
    senderId: senderId ?? ids.user(mockUuid('a0000001')),
    body: loremWords(12),
    status: index % 3 === 0 ? 'read' : 'sent',
  });
}

export function generateMockConversations(count: number): Conversation[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockConversation(i + 1));
}

export function generateMockMessages(count: number, conversationId?: Conversation['id']): Message[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockMessage(i + 1, conversationId));
}
