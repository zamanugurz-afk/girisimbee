/**
 * Supabase activity repository — marketplace_activities.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { ActivityId } from '@/lib/domain/ids';
import type { Activity, CreateActivityInput, ActivityFilter } from '@/features/shared/types/activity.types';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
import { createActivity } from '@/features/shared/factories/moderation.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import {
  isValidUuidValue,
  logSupabaseError,
  prepareSupabaseWrite,
} from '@/lib/persistence/supabase-payload';

const TABLE = 'marketplace_activities';

interface ActivityRow {
  id: string;
  actor_id: string | null;
  verb: string | null;
  activity_type: string | null;
  entity_type: string;
  entity_id: string;
  listing_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapActivityRow(row: ActivityRow): Activity {
  return {
    id: row.id as ActivityId,
    actorId: row.actor_id as Activity['actorId'],
    verb: (row.verb ?? row.activity_type ?? 'listing.created') as Activity['verb'],
    entityType: row.entity_type as Activity['entityType'],
    entityId: row.entity_id,
    summary: row.summary,
    metadata: row.metadata ?? {},
    isPublic: row.is_public,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

/** Map domain activity to live marketplace_activities columns. */
function toActivityInsertRow(activity: Activity): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: activity.id,
    actor_id: activity.actorId,
    verb: activity.verb,
    activity_type: activity.verb,
    entity_type: activity.entityType,
    entity_id: activity.entityId,
    summary: activity.summary,
    metadata: activity.metadata,
    is_public: activity.isPublic,
  };

  if (activity.entityType === 'listing' && isValidUuidValue(activity.entityId)) {
    row.listing_id = activity.entityId;
  }

  return row;
}

export class SupabaseActivityRepository implements ActivityRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: ActivityId, filter?: RepositoryFilter): Promise<Activity | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapActivityRow(data as ActivityRow) : null;
  }

  async findMany(filter: ActivityFilter, pagination?: PaginationParams): Promise<PaginatedResult<Activity>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.actorId) query = query.eq('actor_id', filter.actorId);
    if (filter.entityType) query = query.eq('entity_type', filter.entityType);
    if (filter.entityId) query = query.eq('entity_id', filter.entityId);
    if (filter.isPublic !== undefined) query = query.eq('is_public', filter.isPublic);
    if (filter.verb) {
      const verbs = Array.isArray(filter.verb) ? filter.verb : [filter.verb];
      query = query.in('verb', verbs);
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapActivityRow(r as ActivityRow)), count ?? 0, page, limit);
  }

  async paginate(filter: ActivityFilter, pagination?: PaginationParams): Promise<PaginatedResult<Activity>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ActivityFilter, pagination?: PaginationParams): Promise<PaginatedResult<Activity>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: ActivityFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ActivityId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const activity = createActivity(input);
    const row = prepareSupabaseWrite('insert', TABLE, toActivityInsertRow(activity), {
      requiredUuidFields: ['id', 'entity_id'],
      nullableUuidFields: ['actor_id'],
    });
    const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error) {
      logSupabaseError(error, `${TABLE} insert`);
      throw error;
    }
    return mapActivityRow(data as ActivityRow);
  }

  async softDelete(id: ActivityId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).update({ deleted_at: now(), updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: ActivityId): Promise<void> {
    return this.softDelete(id);
  }

  async findPublicFeed(pagination?: PaginationParams): Promise<PaginatedResult<Activity>> {
    return this.findMany({ isPublic: true }, pagination);
  }

  async findByEntity(entityType: Activity['entityType'], entityId: string): Promise<Activity[]> {
    const { data } = await this.findMany({ entityType, entityId }, { page: 1, limit: 100 });
    return data;
  }
}
