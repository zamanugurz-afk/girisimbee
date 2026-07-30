import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Conversation } from '@/features/messaging/types/conversation.types';
import type { Message } from '@/features/messaging/types/message.types';

export function createConversation(
  overrides: Partial<Conversation> & Pick<Conversation, 'participantIds'>,
): Conversation {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.conversation(crypto.randomUUID()),
    listingId: overrides.listingId ?? null,
    companyId: overrides.companyId ?? null,
    status: overrides.status ?? 'open',
    lastMessageAt: overrides.lastMessageAt ?? null,
    lastMessagePreview: overrides.lastMessagePreview ?? null,
    participantIds: overrides.participantIds,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createMessage(
  overrides: Partial<Message> & Pick<Message, 'conversationId' | 'senderId' | 'body'>,
): Message {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.message(crypto.randomUUID()),
    conversationId: overrides.conversationId,
    senderId: overrides.senderId,
    body: overrides.body,
    status: overrides.status ?? 'sent',
    attachmentUrls: overrides.attachmentUrls ?? [],
    readAt: overrides.readAt ?? null,
    editedAt: overrides.editedAt ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}
