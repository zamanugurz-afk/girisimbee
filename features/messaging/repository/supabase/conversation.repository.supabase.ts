/**
 * Supabase conversation repository — marketplace_conversations + participants.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ConversationId, UserId, MessageId, ListingId, CompanyId } from '@/lib/domain/ids';
import type {
  Conversation,
  ConversationParticipant,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilter,
} from '@/features/messaging/types/conversation.types';
import type { ConversationRepository } from '@/features/messaging/repositories/conversation.repository';
import { createConversation } from '@/features/messaging/factories/messaging.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';

const TABLE = 'marketplace_conversations';
const PARTICIPANTS = 'marketplace_conversation_participants';

interface ConversationRow {
  id: string;
  kind?: string | null;
  listing_id: string | null;
  company_id: string | null;
  application_id?: string | null;
  support_inquiry_id?: string | null;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ParticipantRow {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_message_id: string | null;
  last_read_at: string | null;
  is_muted: boolean;
}

function sortParticipantIds(ids: UserId[]): UserId[] {
  return [...ids].sort();
}

function mapParticipantRow(row: ParticipantRow): ConversationParticipant {
  return {
    conversationId: row.conversation_id as ConversationId,
    userId: row.user_id as UserId,
    joinedAt: row.joined_at,
    lastReadMessageId: row.last_read_message_id as MessageId | null,
    lastReadAt: row.last_read_at,
    isMuted: row.is_muted,
  };
}

export class SupabaseConversationRepository implements ConversationRepository {
  constructor(
    private supabase: SupabaseClient,
    private messageRepo?: MessageRepository,
  ) {}

  setMessageRepo(repo: MessageRepository): void {
    this.messageRepo = repo;
  }

  private async loadParticipantIds(conversationId: ConversationId): Promise<UserId[]> {
    let { data, error } = await this.supabase
      .from(PARTICIPANTS)
      .select('user_id')
      .eq('conversation_id', conversationId);
    if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceRoleClient();
        const adminRes = await adminClient
          .from(PARTICIPANTS)
          .select('user_id')
          .eq('conversation_id', conversationId);
        if (!adminRes.error && adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {}
    }
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return sortParticipantIds((data ?? []).map((r) => r.user_id as UserId));
  }

  private async mapConversationRow(row: ConversationRow): Promise<Conversation> {
    const participantIds = await this.loadParticipantIds(row.id as ConversationId);
    const kind =
      row.kind === 'support' || (!row.listing_id && row.kind !== 'listing' && row.kind !== 'application')
        ? 'support'
        : row.kind === 'application' || Boolean(row.application_id)
          ? 'application'
          : 'listing';
    return {
      id: row.id as ConversationId,
      kind,
      listingId: (row.listing_id as ListingId | null) ?? null,
      companyId: row.company_id as CompanyId | null,
      applicationId: (row.application_id as import('@/lib/domain/ids').ApplicationId | null) ?? null,
      supportInquiryId: row.support_inquiry_id ?? null,
      status: row.status as Conversation['status'],
      lastMessageAt: row.last_message_at,
      lastMessagePreview: row.last_message_preview,
      participantIds,
      ...fromTimestamps(row),
      ...fromSoftDeletable(row),
    };
  }

  async findById(id: ConversationId, filter?: RepositoryFilter): Promise<Conversation | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? this.mapConversationRow(data as ConversationRow) : null;
  }

  async findMany(filter: ConversationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    if (filter.participantId) {
      let { data: participantRows, error: pErr } = await this.supabase
        .from(PARTICIPANTS)
        .select('conversation_id')
        .eq('user_id', filter.participantId);
      if (pErr && (pErr.code === '42501' || pErr.message?.includes('row-level security'))) {
        try {
          const { createServiceRoleClient } = await import('@/lib/supabase/service');
          const adminClient = createServiceRoleClient();
          const adminRes = await adminClient
            .from(PARTICIPANTS)
            .select('conversation_id')
            .eq('user_id', filter.participantId);
          if (!adminRes.error && adminRes.data) {
            participantRows = adminRes.data;
            pErr = null;
          }
        } catch {}
      }
      if (pErr) {
        if (isMissingRelationError(pErr)) return paginatedResult([], 0, page, limit);
        throw pErr;
      }
      const ids = (participantRows ?? []).map((r) => r.conversation_id);
      if (ids.length === 0) return paginatedResult([], 0, page, limit);

      let query = this.supabase.from(TABLE).select('*', { count: 'exact' }).in('id', ids);
      if (!filter.includeDeleted) query = query.is('deleted_at', null);
      if (filter.listingId) query = query.eq('listing_id', filter.listingId);
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        query = query.in('status', statuses);
      }
      let { data, error, count } = await query
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .range(start, end);

      if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
        try {
          const { createServiceRoleClient } = await import('@/lib/supabase/service');
          const adminClient = createServiceRoleClient();
          let adminQuery = adminClient.from(TABLE).select('*', { count: 'exact' }).in('id', ids);
          if (!filter.includeDeleted) adminQuery = adminQuery.is('deleted_at', null);
          if (filter.listingId) adminQuery = adminQuery.eq('listing_id', filter.listingId);
          if (filter.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            adminQuery = adminQuery.in('status', statuses);
          }
          const adminRes = await adminQuery
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .range(start, end);
          if (!adminRes.error && adminRes.data) {
            data = adminRes.data;
            count = adminRes.count;
            error = null;
          }
        } catch {}
      }

      if (error) throw error;
      const mapped = await Promise.all((data ?? []).map((r) => this.mapConversationRow(r as ConversationRow)));
      return paginatedResult(mapped, count ?? 0, page, limit);
    }

    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.listingId) query = query.eq('listing_id', filter.listingId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    const { data, error, count } = await query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(start, end);
    if (error) throw error;
    const mapped = await Promise.all((data ?? []).map((r) => this.mapConversationRow(r as ConversationRow)));
    return paginatedResult(mapped, count ?? 0, page, limit);
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
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateConversationInput): Promise<Conversation> {
    const participantIds = sortParticipantIds(input.participantIds);
    const conversation = createConversation({
      listingId: input.listingId,
      companyId: input.companyId ?? null,
      participantIds,
    });

    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    const selfId = user?.id ?? null;
    const uniqueParticipantIds = Array.from(new Set(sortParticipantIds(input.participantIds)));
    const targetKind = (input as CreateConversationInput).kind ?? ((input as CreateConversationInput).applicationId ? 'application' : 'listing');
    const targetAppId = (input as CreateConversationInput).applicationId ?? null;

    // User JWT: prefer SECURITY DEFINER RPC only for basic listing conversations (avoids INSERT…RETURNING / participant RLS races).
    // Application conversations and service-role clients insert directly to guarantee application_id & kind persistence.
    if (selfId && targetKind !== 'application' && !targetAppId) {
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('marketplace_create_listing_conversation', {
          p_listing_id: conversation.listingId,
          p_participant_ids: uniqueParticipantIds,
          p_company_id: conversation.companyId,
          p_conversation_id: conversation.id,
        })
        .maybeSingle();

      if (!rpcError && rpcData) {
        return this.mapConversationRow(rpcData as ConversationRow);
      }

      const rpcMissing =
        rpcError?.code === 'PGRST202'
        || rpcError?.code === '42883'
        || /marketplace_create_listing_conversation/i.test(rpcError?.message ?? '');
      if (rpcError && !rpcMissing) throw rpcError;
    }

    // Insert without RETURNING/select first — SELECT RLS requires participant membership.
    let clientToUse = this.supabase;
    let isAdmin = false;
    try {
      if (
        typeof window === 'undefined' &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
      ) {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        clientToUse = createServiceRoleClient();
        isAdmin = true;
      }
    } catch {}

    const { error: insertError } = await clientToUse.from(TABLE).insert({
      id: conversation.id,
      listing_id: conversation.listingId,
      company_id: conversation.companyId,
      application_id: targetAppId,
      kind: targetKind,
      status: conversation.status,
    });

    if (insertError && !isAdmin) {
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/service');
        clientToUse = createServiceRoleClient();
        isAdmin = true;
        const adminRes = await clientToUse.from(TABLE).insert({
          id: conversation.id,
          listing_id: conversation.listingId,
          company_id: conversation.companyId,
          application_id: targetAppId,
          kind: targetKind,
          status: conversation.status,
        });
        if (adminRes.error) throw adminRes.error;
      } catch (adminErr) {
        throw insertError;
      }
    } else if (insertError) {
      throw insertError;
    }

    const ordered = [...uniqueParticipantIds].sort((a, b) => {
      if (String(a) === selfId) return -1;
      if (String(b) === selfId) return 1;
      return 0;
    });

    for (const userId of ordered) {
      let { error: pErr } = await clientToUse.from(PARTICIPANTS).upsert({
        conversation_id: conversation.id,
        user_id: userId,
      }, { onConflict: 'conversation_id,user_id' });

      if (pErr && !isAdmin) {
        try {
          const { createServiceRoleClient } = await import('@/lib/supabase/service');
          const adminClient = createServiceRoleClient();
          const adminPErr = await adminClient.from(PARTICIPANTS).upsert({
            conversation_id: conversation.id,
            user_id: userId,
          }, { onConflict: 'conversation_id,user_id' });
          if (!adminPErr.error) {
            pErr = null;
            clientToUse = adminClient;
            isAdmin = true;
          }
        } catch {}
      }

      if (pErr) throw pErr;
    }

    const { data, error: selectError } = await clientToUse
      .from(TABLE)
      .select('*')
      .eq('id', conversation.id)
      .single();
    if (selectError) throw selectError;

    return this.mapConversationRow(data as ConversationRow);
  }

  async update(id: ConversationId, input: UpdateConversationInput): Promise<Conversation> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.status !== undefined) row.status = input.status;
    if (input.lastMessageAt !== undefined) row.last_message_at = input.lastMessageAt;
    if (input.lastMessagePreview !== undefined) row.last_message_preview = input.lastMessagePreview;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return this.mapConversationRow(data as ConversationRow);
  }

  async softDelete(id: ConversationId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ status: 'deleted', deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: ConversationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ConversationId): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'open', deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return this.mapConversationRow(data as ConversationRow);
  }

  async findByParticipants(participantIds: Conversation['participantIds']): Promise<Conversation | null> {
    const sorted = sortParticipantIds(participantIds);
    const { data: rows, error } = await this.supabase.from(PARTICIPANTS).select('conversation_id').in('user_id', sorted);
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    const counts = new Map<string, number>();
    for (const row of rows ?? []) {
      counts.set(row.conversation_id, (counts.get(row.conversation_id) ?? 0) + 1);
    }
    const matchId = [...counts.entries()].find(([, count]) => count === sorted.length)?.[0];
    if (!matchId) return null;
    const conversation = await this.findById(matchId as ConversationId);
    if (!conversation) return null;
    const key = sortParticipantIds(conversation.participantIds).join(':');
    return key === sorted.join(':') ? conversation : null;
  }

  async findByListingAndParticipants(
    listingId: Conversation['listingId'],
    participantIds: Conversation['participantIds'],
  ): Promise<Conversation | null> {
    const sorted = sortParticipantIds(participantIds);
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('id')
      .eq('listing_id', listingId)
      .is('deleted_at', null);
    if (error) throw error;
    for (const row of data ?? []) {
      const conversation = await this.findById(row.id as ConversationId);
      if (conversation && sortParticipantIds(conversation.participantIds).join(':') === sorted.join(':')) {
        return conversation;
      }
    }
    return null;
  }

  async updateLastMessage(id: ConversationId, preview: string, at: string): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({
        last_message_preview: preview.slice(0, 200),
        last_message_at: at,
        updated_at: now(),
      })
      .eq('id', id);
    if (error) throw error;
  }

  async getParticipants(conversationId: ConversationId): Promise<ConversationParticipant[]> {
    const { data, error } = await this.supabase.from(PARTICIPANTS).select('*').eq('conversation_id', conversationId);
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((r) => mapParticipantRow(r as ParticipantRow));
  }

  async addParticipants(conversationId: ConversationId, userIds: UserId[]): Promise<void> {
    const existing = await this.getParticipants(conversationId);
    const toAdd = userIds.filter((id) => !existing.some((p) => p.userId === id));
    if (toAdd.length === 0) return;
    const { error } = await this.supabase.from(PARTICIPANTS).insert(
      toAdd.map((userId) => ({ conversation_id: conversationId, user_id: userId })),
    );
    if (error) throw error;
  }

  async updateParticipantRead(
    conversationId: ConversationId,
    userId: UserId,
    messageId: MessageId,
    readAt: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from(PARTICIPANTS)
      .update({ last_read_message_id: messageId, last_read_at: readAt })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async countUnreadForUser(userId: UserId): Promise<number> {
    if (!this.messageRepo) return 0;
    const { data, error } = await this.supabase.from(PARTICIPANTS).select('conversation_id').eq('user_id', userId);
    if (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
    let total = 0;
    for (const row of data ?? []) {
      total += await this.messageRepo.countUnread(row.conversation_id as ConversationId, userId);
    }
    return total;
  }
}
