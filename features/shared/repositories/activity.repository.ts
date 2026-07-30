import type { ReadRepository } from '@/lib/domain/repository';
import type { ActivityId } from '@/lib/domain/ids';
import type { Activity, CreateActivityInput, ActivityFilter } from '@/features/shared/types/activity.types';

/** Activity is append-only — no update/delete via standard repository. */
export interface ActivityRepository extends ReadRepository<Activity, ActivityId, ActivityFilter> {
  create(input: CreateActivityInput): Promise<Activity>;
  softDelete(id: ActivityId): Promise<void>;
  findPublicFeed(pagination?: import('@/lib/domain/pagination').PaginationParams): Promise<import('@/lib/domain/pagination').PaginatedResult<Activity>>;
}
