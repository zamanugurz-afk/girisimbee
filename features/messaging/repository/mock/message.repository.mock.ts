/**
 * Mock message repository — in-memory message store.
 */
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { MessageId, ConversationId, UserId } from '@/lib/domain/ids';
import type { Message, CreateMessageInput, UpdateMessageInput, MessageFilter } from '@/features/messaging/types/message.types';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createMessage } from '@/features/messaging/factories/messaging.factory';

export class MockMessageRepository implements MessageRepository {
  private messages = new Map<MessageId, Message>();

  async findById(id: MessageId, filter?: RepositoryFilter): Promise<Message | null> {
    const m = this.messages.get(id);
    if (!m) return null;
    if (!filter?.includeDeleted && m.deletedAt) return null;
    return m;
  }

  async findMany(filter: MessageFilter, pagination?: PaginationParams): Promise<PaginatedResult<Message>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.messages.values()];
    if (!filter.includeDeleted) results = results.filter((m) => !m.deletedAt);
    if (filter.conversationId) results = results.filter((m) => m.conversationId === filter.conversationId);
    if (filter.senderId) results = results.filter((m) => m.senderId === filter.senderId);
    if (filter.after) results = results.filter((m) => m.createdAt > filter.after!);
    if (filter.before) results = results.filter((m) => m.createdAt < filter.before!);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((m) => statuses.includes(m.status));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: MessageFilter, pagination?: PaginationParams): Promise<PaginatedResult<Message>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: MessageFilter, pagination?: PaginationParams): Promise<PaginatedResult<Message>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: MessageFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: MessageId): Promise<boolean> {
    return this.messages.has(id);
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const message = createMessage({
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body,
      attachmentUrls: input.attachmentUrls ?? [],
    });
    this.messages.set(message.id, message);
    return message;
  }

  async update(id: MessageId, input: UpdateMessageInput): Promise<Message> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Message', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.messages.set(id, updated);
    return updated;
  }

  async softDelete(id: MessageId): Promise<void> {
    const m = await this.findById(id);
    if (!m) throw new NotFoundError('Message', id);
    this.messages.set(id, { ...m, status: 'deleted', deletedAt: now(), updatedAt: now() });
  }

  async delete(id: MessageId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: MessageId): Promise<Message> {
    const m = await this.findById(id, { includeDeleted: true });
    if (!m) throw new NotFoundError('Message', id);
    const updated = { ...m, status: 'sent' as Message['status'], deletedAt: null, updatedAt: now() };
    this.messages.set(id, updated);
    return updated;
  }

  async findByConversationId(
    conversationId: ConversationId,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Message>> {
    return this.findMany({ conversationId }, pagination);
  }

  async markAsRead(conversationId: ConversationId, readerId: UserId, upToMessageId: MessageId): Promise<number> {
    let count = 0;
    const upTo = this.messages.get(upToMessageId);
    if (!upTo) return 0;
    for (const [id, m] of this.messages) {
      if (
        m.conversationId === conversationId &&
        m.senderId !== readerId &&
        !m.deletedAt &&
        m.createdAt <= upTo.createdAt &&
        m.status !== 'read'
      ) {
        this.messages.set(id, { ...m, status: 'read', readAt: now(), updatedAt: now() });
        count += 1;
      }
    }
    return count;
  }

  async countUnread(conversationId: ConversationId, readerId: UserId): Promise<number> {
    return [...this.messages.values()].filter(
      (m) =>
        m.conversationId === conversationId &&
        m.senderId !== readerId &&
        !m.deletedAt &&
        m.status !== 'read',
    ).length;
  }
}
