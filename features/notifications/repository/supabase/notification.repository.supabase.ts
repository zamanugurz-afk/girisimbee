/**
 * Supabase notification repository — marketplace_notifications.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { NotificationId, UserId } from '@/lib/domain/ids';
import type { Notification, CreateNotificationInput, UpdateNotificationInput, NotificationFilter } from '@/features/notifications/types/notification.types';
import type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
import { createNotification } from '@/features/notifications/factories/notification.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TABLE = 'marketplace_notifications';

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  status: string;
  title: string;
  body: string;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  delivered_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id as NotificationId,
    userId: row.user_id as UserId,
    type: row.type as Notification['type'],
    status: row.status as Notification['status'],
    title: row.title,
    body: row.body,
    actionUrl: row.action_url,
    entityType: row.entity_type as Notification['entityType'],
    entityId: row.entity_id,
    readAt: row.read_at,
    deliveredAt: row.delivered_at,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: NotificationId, filter?: RepositoryFilter): Promise<Notification | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapNotificationRow(data as NotificationRow) : null;
  }

  async findMany(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.unreadOnly) query = query.neq('status', 'read');
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      query = query.in('type', types);
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapNotificationRow(r as NotificationRow)), count ?? 0, page, limit);
  }

  async paginate(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: NotificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Notification>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: NotificationFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async countUnread(userId: UserId): Promise<number> {
    return this.count({ userId, unreadOnly: true });
  }

  async exists(id: NotificationId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = createNotification(input);
    const { data, error } = await this.supabase.from(TABLE).insert({
      id: notification.id,
      user_id: notification.userId,
      type: notification.type,
      status: notification.status,
      title: notification.title,
      body: notification.body,
      action_url: notification.actionUrl,
      entity_type: notification.entityType,
      entity_id: notification.entityId,
      metadata: notification.metadata,
      delivered_at: notification.deliveredAt,
    }).select('*').single();
    if (error) throw error;
    return mapNotificationRow(data as NotificationRow);
  }

  async update(id: NotificationId, input: UpdateNotificationInput): Promise<Notification> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.status !== undefined) row.status = input.status;
    if (input.readAt !== undefined) row.read_at = input.readAt;
    if (input.deliveredAt !== undefined) row.delivered_at = input.deliveredAt;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Notification', id);
    return mapNotificationRow(data as NotificationRow);
  }

  async softDelete(id: NotificationId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ status: 'deleted', deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: NotificationId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: NotificationId): Promise<Notification> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'delivered', deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Notification', id);
    return mapNotificationRow(data as NotificationRow);
  }

  async markAllAsRead(userId: UserId): Promise<number> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'read', read_at: now(), updated_at: now() })
      .eq('user_id', userId)
      .neq('status', 'read')
      .is('deleted_at', null)
      .select('id');
    if (error) throw error;
    return data?.length ?? 0;
  }

  async markAsRead(id: NotificationId): Promise<Notification> {
    return this.update(id, { status: 'read', readAt: now() });
  }
}
