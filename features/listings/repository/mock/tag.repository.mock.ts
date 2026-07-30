/**
 * Mock tag repository — in-memory tag + listing junction store.
 */
import { now, slugify } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { TagId, ListingId } from '@/lib/domain/ids';
import type { Tag, ListingTag, CreateTagInput, UpdateTagInput, TagFilter } from '@/features/listings/types/tag.types';
import type { TagRepository } from '@/features/listings/repositories/tag.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { RepositoryFilter } from '@/lib/domain/pagination';
import { createTag } from '@/features/listings/factories/tag.factory';

export class MockTagRepository implements TagRepository {
  private tags = new Map<string, Tag>();
  private listingTags = new Map<string, ListingTag[]>();

  async findById(id: TagId, filter?: RepositoryFilter): Promise<Tag | null> {
    const tag = this.tags.get(id);
    if (!tag) return null;
    if (!filter?.includeDeleted && tag.deletedAt) return null;
    return tag;
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const tag = [...this.tags.values()].find((t) => t.slug === slug && !t.deletedAt);
    return tag ?? null;
  }

  async findByListingId(listingId: ListingId): Promise<Tag[]> {
    const junctions = this.listingTags.get(listingId) ?? [];
    return junctions.map((lt) => this.tags.get(lt.tagId)).filter((t): t is Tag => Boolean(t));
  }

  async findMany(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.tags.values()];
    if (!filter.includeDeleted) results = results.filter((t) => !t.deletedAt);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((t) => statuses.includes(t.status));
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(q));
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: TagFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: TagId): Promise<boolean> {
    return this.tags.has(id);
  }

  async create(input: CreateTagInput): Promise<Tag> {
    const tag = createTag(input);
    this.tags.set(tag.id, tag);
    return tag;
  }

  async update(id: TagId, input: UpdateTagInput): Promise<Tag> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Tag', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.tags.set(id, updated);
    return updated;
  }

  async softDelete(id: TagId): Promise<void> {
    const tag = await this.findById(id);
    if (!tag) throw new NotFoundError('Tag', id);
    this.tags.set(id, { ...tag, deletedAt: now(), status: 'deleted', updatedAt: now() });
  }

  async delete(id: TagId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: TagId): Promise<Tag> {
    const tag = await this.findById(id, { includeDeleted: true });
    if (!tag) throw new NotFoundError('Tag', id);
    const updated = { ...tag, deletedAt: null, status: 'active' as Tag['status'], updatedAt: now() };
    this.tags.set(id, updated);
    return updated;
  }

  async attachToListing(listingId: ListingId, tagId: TagId): Promise<ListingTag> {
    const junction: ListingTag = { listingId, tagId, createdAt: now() };
    const existing = this.listingTags.get(listingId) ?? [];
    if (!existing.some((lt) => lt.tagId === tagId)) {
      this.listingTags.set(listingId, [...existing, junction]);
    }
    return junction;
  }

  async detachFromListing(listingId: ListingId, tagId: TagId): Promise<void> {
    const existing = this.listingTags.get(listingId) ?? [];
    this.listingTags.set(listingId, existing.filter((lt) => lt.tagId !== tagId));
  }

  async incrementUsageCount(id: TagId, delta = 1): Promise<void> {
    const tag = await this.findById(id);
    if (!tag) throw new NotFoundError('Tag', id);
    this.tags.set(id, { ...tag, usageCount: tag.usageCount + delta, updatedAt: now() });
  }

  async findOrCreateByName(name: string): Promise<Tag> {
    const slug = slugify(name);
    const existing = await this.findBySlug(slug);
    if (existing) return existing;
    return this.create({ slug, name });
  }

  async setTagsForListing(listingId: ListingId, tagNames: string[]): Promise<Tag[]> {
    const tags = await Promise.all(tagNames.map((name) => this.findOrCreateByName(name)));
    this.listingTags.set(
      listingId,
      tags.map((tag) => ({ listingId, tagId: tag.id, createdAt: now() })),
    );
    return tags;
  }
}

export const mockTagRepository = new MockTagRepository();
