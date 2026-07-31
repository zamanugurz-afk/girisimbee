import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { DocumentId, ProfileId } from '@/lib/domain/ids';
import type {
  MarketplaceDocument,
  DocumentFilter,
  CreateDocumentInput,
} from '@/features/documents/types/document.types';
import type {
  DocumentRepository,
  UpdateDocumentInput,
} from '@/features/documents/repositories/document.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createDocument } from '@/features/documents/factories/document.factory';
import {
  mapDocumentRow,
  toDocumentRow,
  type DocumentRow,
} from '@/features/documents/repository/supabase/document.mapper';
import { ids } from '@/lib/domain/ids';

const TABLE = 'marketplace_documents';

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: DocumentId, filter?: RepositoryFilter): Promise<MarketplaceDocument | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapDocumentRow(data as DocumentRow) : null;
  }

  private applyFilter(query: ReturnType<SupabaseClient['from']>, filter: DocumentFilter) {
    let q = query.select('*', { count: 'exact' });
    if (!filter.includeDeleted) q = q.is('deleted_at', null);
    if (filter.ownerProfileId) q = q.eq('owner_profile_id', filter.ownerProfileId);
    if (filter.listingId) q = q.eq('listing_id', filter.listingId);
    if (filter.documentType) q = q.eq('document_type', filter.documentType);
    return q;
  }

  async findMany(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    const { data, error, count } = await this.applyFilter(this.supabase.from(TABLE), filter)
      .order('created_at', { ascending: false })
      .range(start, end);
    if (error) throw error;
    return paginatedResult(
      (data ?? []).map((r) => mapDocumentRow(r as DocumentRow)),
      count ?? 0,
      page,
      limit,
    );
  }

  async paginate(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: DocumentFilter): Promise<number> {
    const { count, error } = await this.applyFilter(this.supabase.from(TABLE), filter);
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: DocumentId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateDocumentInput): Promise<MarketplaceDocument> {
    const entity = createDocument({ ...input, id: ids.document(crypto.randomUUID()) });
    const row = { id: entity.id, ...toDocumentRow(entity) };
    const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return mapDocumentRow(data as DocumentRow);
  }

  async update(id: DocumentId, input: UpdateDocumentInput): Promise<MarketplaceDocument> {
    const row = { ...toDocumentRow(input), updated_at: now() };
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Document', id);
    return mapDocumentRow(data as DocumentRow);
  }

  async softDelete(id: DocumentId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: DocumentId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: DocumentId): Promise<MarketplaceDocument> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Document', id);
    return mapDocumentRow(data as DocumentRow);
  }

  async findByOwner(ownerProfileId: ProfileId): Promise<MarketplaceDocument[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('owner_profile_id', ownerProfileId)
      .is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((r) => mapDocumentRow(r as DocumentRow));
  }
}
