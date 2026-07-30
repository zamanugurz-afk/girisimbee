/**
 * Shared Supabase query helpers — pagination, soft delete, text search.
 */
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';

type QueryBuilder = PostgrestFilterBuilder<any, any, any, any, any>;

export function applySoftDelete<T extends QueryBuilder>(
  query: T,
  includeDeleted?: boolean,
  column = 'deleted_at',
): T {
  if (!includeDeleted) {
    return query.is(column, null) as T;
  }
  return query;
}

export function applyPaginationRange<T extends QueryBuilder>(
  query: T,
  pagination?: PaginationParams,
): { query: T; page: number; limit: number } {
  const { page, limit } = normalizePagination(pagination);
  const start = offset(page, limit);
  const end = start + limit - 1;
  return { query: query.range(start, end) as T, page, limit };
}

export function applyTextSearch<T extends QueryBuilder>(
  query: T,
  columns: string[],
  searchQuery?: string,
): T {
  if (!searchQuery?.trim()) return query;
  const q = searchQuery.trim();
  const conditions = columns.map((col) => `${col}.ilike.%${q}%`).join(',');
  return query.or(conditions) as T;
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return paginatedResult(data, total, page, limit);
}

export async function executePaginated<T>(
  buildQuery: () => { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: Error | null; count: number | null }> },
  pagination?: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = normalizePagination(pagination);
  const start = offset(page, limit);
  const end = start + limit - 1;
  const { data, error, count } = await buildQuery().range(start, end);
  if (error) throw error;
  return buildPaginatedResult((data ?? []) as T[], count ?? 0, page, limit);
}
