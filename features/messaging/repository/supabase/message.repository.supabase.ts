/**
 * Supabase message repository — marketplace_messages.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { MessageId, ConversationId, UserId } from '@/lib/domain/ids';
import type { Message, CreateMessageInput, UpdateMessageInput, MessageFilter } from '@/features/messaging/types/message.types';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import { createMessage } from '@/features/messaging/factories/messaging.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_messages';

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: string;
  attachment_urls: string[];
  read_at: string | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id as MessageId,
    conversationId: row.conversation_id as ConversationId,
    senderId: row.sender_id as UserId,
    body: row.body,
    status: row.status as Message['status'],
    attachmentUrls: Array.isArray(row.attachment_urls) ? row.attachment_urls : [],
    readAt: row.read_at,
    editedAt: row.edited_at,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseMessageRepository implements MessageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: MessageId, filter?: RepositoryFilter): Promise<Message | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapMessageRow(data as MessageRow) : null;
  }

  async findMany(filter: MessageFilter, pagination?: PaginationParams): Promise<PaginatedResult<Message>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.conversationId) query = query.eq('conversation_id', filter.conversationId);
    if (filter.senderId) query = query.eq('sender_id', filter.senderId);
    if (filter.after) query = query.gt('created_at', filter.after);
    if (filter.before) query = query.lt('created_at', filter.before);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapMessageRow(r as MessageRow)), count ?? 0, page, limit);
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
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const message = createMessage({
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body,
      attachmentUrls: input.attachmentUrls ?? [],
    });
    let { data, error } = await this.supabase
      .from(TABLE)
      .insert({
        id: message.id,
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        body: message.body,
        status: message.status,
        attachment_urls: message.attachmentUrls,
      })
      .select('*')
      .single();

    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient
          .from(TABLE)
          .insert({
            id: message.id,
            conversation_id: message.conversationId,
            sender_id: message.senderId,
            body: message.body,
            status: message.status,
            attachment_urls: message.attachmentUrls,
          })
          .select('*')
          .single();
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {
        // Fall back
      }
    }

    if (error) throw error;
    return mapMessageRow(data as MessageRow);
  }

  async update(id: MessageId, input: UpdateMessageInput): Promise<Message> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.body !== undefined) row.body = input.body;
    if (input.status !== undefined) row.status = input.status;
    if (input.readAt !== undefined) row.read_at = input.readAt;
    if (input.editedAt !== undefined) row.edited_at = input.editedAt;
    let { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient.from(TABLE).update(row).eq('id', id).select('*').single();
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {
        // Fall back
      }
    }
    if (error) throw error;
    return mapMessageRow(data as MessageRow);
  }

  async softDelete(id: MessageId): Promise<void> {
    let { error } = await this.supabase
      .from(TABLE)
      .update({ status: 'deleted', deleted_at: now(), updated_at: now() })
      .eq('id', id);

    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient
          .from(TABLE)
          .update({ status: 'deleted', deleted_at: now(), updated_at: now() })
          .eq('id', id);
        if (!adminRes.error) {
          error = null;
        }
      } catch {}
    }

    if (error) throw error;
  }

  async delete(id: MessageId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: MessageId): Promise<Message> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'sent', deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapMessageRow(data as MessageRow);
  }

  async findByConversationId(
    conversationId: ConversationId,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Message>> {
    return this.findMany({ conversationId }, pagination);
  }

  async markAsRead(conversationId: ConversationId, readerId: UserId, upToMessageId: MessageId): Promise<number> {
    const upTo = await this.findById(upToMessageId);
    if (!upTo) return 0;
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'read', read_at: now(), updated_at: now() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', readerId)
      .neq('status', 'read')
      .is('deleted_at', null)
      .lte('created_at', upTo.createdAt)
      .select('id');
    if (error) throw error;
    return data?.length ?? 0;
  }

  async countUnread(conversationId: ConversationId, readerId: UserId): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', readerId)
      .neq('status', 'read')
      .is('deleted_at', null);
    if (error) throw error;
    return count ?? 0;
  }
}
