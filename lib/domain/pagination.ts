/**
 * Pagination & sorting — cursor-based for large datasets.
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface RepositoryFilter {
  includeDeleted?: boolean;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function normalizePagination(params?: PaginationParams): Required<Pick<PaginationParams, 'page' | 'limit'>> {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
  return { page, limit };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  nextCursor?: string,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
    nextCursor,
  };
}

export function offset(page: number, limit: number): number {
  return (page - 1) * limit;
}
