/**
 * Mock conversation repository — in-memory store with participants.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { ConversationId, UserId, MessageId } from '@/lib/domain/ids';
import type {
  Conversation,
  ConversationParticipant,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilter,
} from '@/features/messaging/types/conversation.types';
import type { ConversationRepository } from '@/features/messaging/repositories/conversation.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createConversation } from '@/features/messaging/factories/messaging.factory';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';

function sortParticipantIds(ids: UserId[]): UserId[] {
  return [...ids].sort();
}

function participantKey(ids: UserId[]): string {
  return sortParticipantIds(ids).join(':');
}

export class MockConversationRepository implements ConversationRepository {
  private conversations = new Map<ConversationId, Conversation>();
  private participants = new Map<ConversationId, ConversationParticipant[]>();

  constructor(private messageRepo?: MessageRepository) {}

  setMessageRepo(repo: MessageRepository): void {
    this.messageRepo = repo;
  }

  async findById(id: ConversationId, filter?: RepositoryFilter): Promise<Conversation | null> {
    const c = this.conversations.get(id);
    if (!c) return null;
    if (!filter?.includeDeleted && c.deletedAt) return null;
    return c;
  }

  async findMany(filter: ConversationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.conversations.values()];
    if (!filter.includeDeleted) results = results.filter((c) => !c.deletedAt);
    if (filter.participantId) {
      results = results.filter((c) => c.participantIds.includes(filter.participantId!));
    }
    if (filter.listingId) results = results.filter((c) => c.listingId === filter.listingId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((c) => statuses.includes(c.status));
    }
    results.sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: ConversationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ConversationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ConversationFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ConversationId): Promise<boolean> {
    return this.conversations.has(id);
  }

  async create(input: CreateConversationInput): Promise<Conversation> {
    if (input.applicationId) {
      for (const c of this.conversations.values()) {
        if (!c.deletedAt && c.applicationId === input.applicationId) {
          return c;
        }
      }
    }
    const participantIds = sortParticipantIds(input.participantIds);
    const conversation = createConversation({
      listingId: input.listingId,
      companyId: input.companyId ?? null,
      applicationId: input.applicationId ?? null,
      kind: input.kind ?? (input.applicationId ? 'application' : 'listing'),
      participantIds,
    });
    this.conversations.set(conversation.id, conversation);
    const joinedAt = now();
    this.participants.set(
      conversation.id,
      participantIds.map((userId) => ({
        conversationId: conversation.id,
        userId,
        joinedAt,
        lastReadMessageId: null,
        lastReadAt: null,
        isMuted: false,
      })),
    );
    return conversation;
  }

  async update(id: ConversationId, input: UpdateConversationInput): Promise<Conversation> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Conversation', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.conversations.set(id, updated);
    return updated;
  }

  async softDelete(id: ConversationId): Promise<void> {
    const c = await this.findById(id);
    if (!c) throw new NotFoundError('Conversation', id);
    this.conversations.set(id, { ...c, status: 'deleted', deletedAt: now(), updatedAt: now() });
  }

  async delete(id: ConversationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ConversationId): Promise<Conversation> {
    const c = await this.findById(id, { includeDeleted: true });
    if (!c) throw new NotFoundError('Conversation', id);
    const updated = { ...c, status: 'open' as Conversation['status'], deletedAt: null, updatedAt: now() };
    this.conversations.set(id, updated);
    return updated;
  }

  async findByParticipants(participantIds: Conversation['participantIds']): Promise<Conversation | null> {
    const key = participantKey(participantIds);
    for (const c of this.conversations.values()) {
      if (!c.deletedAt && participantKey(c.participantIds) === key) return c;
    }
    return null;
  }

  async findByListingAndParticipants(
    listingId: Conversation['listingId'],
    participantIds: Conversation['participantIds'],
  ): Promise<Conversation | null> {
    const key = participantKey(participantIds);
    for (const c of this.conversations.values()) {
      if (!c.deletedAt && c.listingId === listingId && participantKey(c.participantIds) === key) return c;
    }
    return null;
  }

  async updateLastMessage(id: ConversationId, preview: string, at: string): Promise<void> {
    const c = await this.findById(id);
    if (!c) throw new NotFoundError('Conversation', id);
    this.conversations.set(id, {
      ...c,
      lastMessagePreview: preview.slice(0, 200),
      lastMessageAt: at,
      updatedAt: now(),
    });
  }

  async getParticipants(conversationId: ConversationId): Promise<ConversationParticipant[]> {
    return this.participants.get(conversationId) ?? [];
  }

  async addParticipants(conversationId: ConversationId, userIds: UserId[]): Promise<void> {
    const existing = this.participants.get(conversationId) ?? [];
    const joinedAt = now();
    const merged = [...existing];
    for (const userId of userIds) {
      if (!merged.some((p) => p.userId === userId)) {
        merged.push({
          conversationId,
          userId,
          joinedAt,
          lastReadMessageId: null,
          lastReadAt: null,
          isMuted: false,
        });
      }
    }
    this.participants.set(conversationId, merged);
    const c = await this.findById(conversationId);
    if (c) {
      this.conversations.set(conversationId, {
        ...c,
        participantIds: sortParticipantIds(merged.map((p) => p.userId)),
        updatedAt: now(),
      });
    }
  }

  async updateParticipantRead(
    conversationId: ConversationId,
    userId: UserId,
    messageId: MessageId,
    readAt: string,
  ): Promise<void> {
    const parts = this.participants.get(conversationId);
    if (!parts) return;
    this.participants.set(
      conversationId,
      parts.map((p) =>
        p.userId === userId ? { ...p, lastReadMessageId: messageId, lastReadAt: readAt } : p,
      ),
    );
  }

  async countUnreadForUser(userId: UserId): Promise<number> {
    if (!this.messageRepo) return 0;
    let total = 0;
    for (const c of this.conversations.values()) {
      if (c.deletedAt || !c.participantIds.includes(userId)) continue;
      total += await this.messageRepo.countUnread(c.id, userId);
    }
    return total;
  }
}
