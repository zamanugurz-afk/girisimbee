import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { SoftDeletable, Timestamps } from '@/lib/domain/base';

/**
 * Base repository contract — all feature repositories extend this pattern.
 */
export interface ReadRepository<T, TId extends string, TFilter = Record<string, unknown>> {
  findById(id: TId, filter?: RepositoryFilter): Promise<T | null>;
  findMany(filter: TFilter, pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  /** Alias for findMany — explicit pagination contract. */
  paginate(filter: TFilter, pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  /** Full-text / filter search — entities with `query` in filter support text search. */
  search(filter: TFilter, pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  count(filter: TFilter): Promise<number>;
  exists(id: TId): Promise<boolean>;
}

export interface WriteRepository<T, TId extends string, TCreate, TUpdate> {
  create(input: TCreate): Promise<T>;
  update(id: TId, input: TUpdate): Promise<T>;
  softDelete(id: TId): Promise<void>;
  /** Alias for softDelete — production contract name. */
  delete(id: TId): Promise<void>;
  restore(id: TId): Promise<T>;
}

export interface Repository<T, TId extends string, TCreate, TUpdate, TFilter = Record<string, unknown>>
  extends ReadRepository<T, TId, TFilter>,
    WriteRepository<T, TId, TCreate, TUpdate> {}

export type EntityRecord = Timestamps & SoftDeletable;

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: { id: string; message: string }[];
}
