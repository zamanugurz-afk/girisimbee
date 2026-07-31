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

export class MockDocumentRepository implements DocumentRepository {
  private documents = new Map<DocumentId, MarketplaceDocument>();

  async findById(id: DocumentId, filter?: RepositoryFilter): Promise<MarketplaceDocument | null> {
    const doc = this.documents.get(id);
    if (!doc) return null;
    if (!filter?.includeDeleted && doc.deletedAt) return null;
    return doc;
  }

  async findMany(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.documents.values()];
    if (!filter.includeDeleted) results = results.filter((d) => !d.deletedAt);
    if (filter.ownerProfileId) results = results.filter((d) => d.ownerProfileId === filter.ownerProfileId);
    if (filter.listingId) results = results.filter((d) => d.listingId === filter.listingId);
    if (filter.documentType) results = results.filter((d) => d.documentType === filter.documentType);
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: DocumentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplaceDocument>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: DocumentFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: DocumentId): Promise<boolean> {
    return this.documents.has(id);
  }

  async create(input: CreateDocumentInput): Promise<MarketplaceDocument> {
    const doc = createDocument(input);
    this.documents.set(doc.id, doc);
    return doc;
  }

  async update(id: DocumentId, input: UpdateDocumentInput): Promise<MarketplaceDocument> {
    const existing = this.documents.get(id);
    if (!existing) throw new NotFoundError('Document', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.documents.set(id, updated);
    return updated;
  }

  async softDelete(id: DocumentId): Promise<void> {
    const existing = this.documents.get(id);
    if (!existing) throw new NotFoundError('Document', id);
    this.documents.set(id, { ...existing, deletedAt: now(), updatedAt: now() });
  }

  async delete(id: DocumentId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: DocumentId): Promise<MarketplaceDocument> {
    const existing = this.documents.get(id);
    if (!existing) throw new NotFoundError('Document', id);
    const updated = { ...existing, deletedAt: null, updatedAt: now() };
    this.documents.set(id, updated);
    return updated;
  }

  async findByOwner(ownerProfileId: ProfileId): Promise<MarketplaceDocument[]> {
    return [...this.documents.values()].filter(
      (d) => d.ownerProfileId === ownerProfileId && !d.deletedAt,
    );
  }
}
