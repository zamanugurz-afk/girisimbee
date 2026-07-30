// Feature: search — global search, filters, results (scaffold)
export type SearchQuery = {
  q: string;
  categoryId?: string;
  page?: number;
};
