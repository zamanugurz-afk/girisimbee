/**
 * Supabase notifications repository.
 * Falls back to marketplace_notifications when notifications is not migrated yet.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { InboxNotificationRepository } from '@/features/notifications/repositories/inbox-notification.repository';
import type { InboxNotification } from '@/features/notifications/types/inbox-notification.types';
import {
  mapInboxNotificationRow,
  mapMarketplaceNotificationFallback,
  type InboxNotificationRow,
  type MarketplaceNotificationFallbackRow,
} from '@/features/notifications/repository/supabase/inbox-notification.mapper';

const PRIMARY_TABLE = 'notifications';
const FALLBACK_TABLE = 'marketplace_notifications';

type ResolvedTable = typeof PRIMARY_TABLE | typeof FALLBACK_TABLE;

export class SupabaseInboxNotificationRepository implements InboxNotificationRepository {
  private resolvedTable: ResolvedTable | 'none' | null = null;

  constructor(private readonly supabase: SupabaseClient) {}

  private async resolveTable(): Promise<ResolvedTable | null> {
    if (this.resolvedTable === 'none') return null;
    if (this.resolvedTable) return this.resolvedTable;

    const primary = await this.supabase.from(PRIMARY_TABLE).select('id').limit(1);
    if (!primary.error) {
      this.resolvedTable = PRIMARY_TABLE;
      return this.resolvedTable;
    }
    if (!isMissingRelationError(primary.error)) {
      throw primary.error;
    }

    const fallback = await this.supabase.from(FALLBACK_TABLE).select('id').limit(1);
    if (!fallback.error || !isMissingRelationError(fallback.error)) {
      this.resolvedTable = FALLBACK_TABLE;
      return this.resolvedTable;
    }

    this.resolvedTable = 'none';
    return null;
  }

  async listByUser(userId: UserId): Promise<InboxNotification[]> {
    const table = await this.resolveTable();
    if (!table) return [];

    if (table === PRIMARY_TABLE) {
      const { data, error } = await this.supabase
        .from(table)
        .select('id, user_id, title, description, type, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        if (isMissingRelationError(error)) return [];
        throw error;
      }
      return (data ?? []).map((row) =>
        mapInboxNotificationRow(row as InboxNotificationRow),
      );
    }

    const { data, error } = await this.supabase
      .from(table)
      .select('id, user_id, title, body, type, status, read_at, created_at, deleted_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) =>
      mapMarketplaceNotificationFallback(row as MarketplaceNotificationFallbackRow),
    );
  }

  async markAsRead(id: NotificationId, userId: UserId): Promise<InboxNotification> {
    const table = await this.resolveTable();
    if (!table) throw new Error('Bildirim tablosu henüz hazır değil.');

    if (table === PRIMARY_TABLE) {
      const { data, error } = await this.supabase
        .from(table)
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, title, description, type, is_read, created_at')
        .single();
      if (error) throw error;
      return mapInboxNotificationRow(data as InboxNotificationRow);
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from(table)
      .update({ status: 'read', read_at: now, updated_at: now })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('id, user_id, title, body, type, status, read_at, created_at, deleted_at')
      .single();
    if (error) throw error;
    return mapMarketplaceNotificationFallback(data as MarketplaceNotificationFallbackRow);
  }

  async markAllAsRead(userId: UserId): Promise<number> {
    const table = await this.resolveTable();
    if (!table) return 0;

    if (table === PRIMARY_TABLE) {
      const { data, error } = await this.supabase
        .from(table)
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');
      if (error) {
        if (isMissingRelationError(error)) return 0;
        throw error;
      }
      return data?.length ?? 0;
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from(table)
      .update({ status: 'read', read_at: now, updated_at: now })
      .eq('user_id', userId)
      .neq('status', 'read')
      .is('deleted_at', null)
      .select('id');
    if (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
    return data?.length ?? 0;
  }

  async delete(id: NotificationId, userId: UserId): Promise<void> {
    const table = await this.resolveTable();
    if (!table) return;

    if (table === PRIMARY_TABLE) {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error && !isMissingRelationError(error)) throw error;
      return;
    }

    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from(table)
      .update({ status: 'deleted', deleted_at: now, updated_at: now })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (error && !isMissingRelationError(error)) throw error;
  }

  async clearByUser(userId: UserId): Promise<number> {
    const table = await this.resolveTable();
    if (!table) return 0;

    if (table === PRIMARY_TABLE) {
      const { data, error } = await this.supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
        .select('id');
      if (error) {
        if (isMissingRelationError(error)) return 0;
        throw error;
      }
      return data?.length ?? 0;
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from(table)
      .update({ status: 'deleted', deleted_at: now, updated_at: now })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('id');
    if (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
    return data?.length ?? 0;
  }
}
