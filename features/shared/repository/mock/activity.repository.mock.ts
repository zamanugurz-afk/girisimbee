/**
 * Mock activity repository — in-memory append-only activity store.
 */
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { ActivityId } from '@/lib/domain/ids';
import type { Activity, CreateActivityInput, ActivityFilter } from '@/features/shared/types/activity.types';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createActivity } from '@/features/shared/factories/moderation.factory';
import { now } from '@/lib/domain/factory';

export class MockActivityRepository implements ActivityRepository {
  private activities: Activity[] = [];

  async findById(id: ActivityId, filter?: RepositoryFilter): Promise<Activity | null> {
    const activity = this.activities.find((a) => a.id === id);
    if (!activity) return null;
    if (!filter?.includeDeleted && activity.deletedAt) return null;
    return activity;
  }

  async findMany(filter: ActivityFilter, pagination?: PaginationParams): Promise<PaginatedResult<Activity>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.activities];
    if (!filter.includeDeleted) results = results.filter((a) => !a.deletedAt);
    if (filter.actorId) results = results.filter((a) => a.actorId === filter.actorId);
    if (filter.entityType) results = results.filter((a) => a.entityType === filter.entityType);
    if (filter.entityId) results = results.filter((a) => a.entityId === filter.entityId);
    if (filter.isPublic !== undefined) results = results.filter((a) => a.isPublic === filter.isPublic);
    if (filter.after) results = results.filter((a) => a.createdAt >= filter.after!);
    if (filter.before) results = results.filter((a) => a.createdAt <= filter.before!);
    if (filter.verb) {
      const verbs = Array.isArray(filter.verb) ? filter.verb : [filter.verb];
      results = results.filter((a) => verbs.includes(a.verb));
    }
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
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
    return this.activities.some((a) => a.id === id);
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const activity = createActivity(input);
    this.activities.unshift(activity);
    return activity;
  }

  async softDelete(id: ActivityId): Promise<void> {
    const idx = this.activities.findIndex((a) => a.id === id);
    if (idx === -1) throw new NotFoundError('Activity', id);
    this.activities[idx] = { ...this.activities[idx], deletedAt: now(), updatedAt: now() };
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

export const mockActivityRepository = new MockActivityRepository();
