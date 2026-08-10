/**
 * Mock listing repository — in-memory implementation for tests and offline dev.
 */
import { now, slugify } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { computeFranchiseListingExpiry, computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError, ConflictError } from '@/lib/domain/errors';
import type { ListingId } from '@/lib/domain/ids';
import type { Listing, ListingFilter, ListingStatus, CreateListingInput, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { RepositoryFilter } from '@/lib/domain/pagination';
import { LISTING_LIFECYCLE } from '@/features/listings/types/listing.entity.types';
import { createListing } from '@/features/listings/factories/listing.factory';
import { sortListings } from '@/features/listings/utils/listing-sort';
import {
  expandCategoryIdFilter,
  expandListingTypeIdFilter,
} from '@/lib/domain/legacy-category-ids';
import { listingMatchesCityFilter } from '@/features/listings/utils/city-filter';
import {
  formatListingNumber,
  parseListingNumberQuery,
} from '@/features/listings/utils/listing-number';

export class MockListingRepository implements ListingRepository {
  private listings = new Map<ListingId, Listing>();
  private slugIndex = new Map<string, ListingId>();

  async findById(id: ListingId, filter?: RepositoryFilter): Promise<Listing | null> {
    const listing = this.listings.get(id);
    if (!listing) return null;
    if (!filter?.includeDeleted && listing.deletedAt) return null;
    return listing;
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    return this.findById(id);
  }

  async findMany(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.listings.values()];

    if (!filter.includeDeleted) results = results.filter((l) => !l.deletedAt);
    if (filter.ownerId) results = results.filter((l) => l.ownerId === filter.ownerId);
    if (filter.categoryId) {
      const categoryIds = expandCategoryIdFilter(filter.categoryId);
      results = results.filter((l) => categoryIds.includes(l.categoryId));
    }
    if (filter.listingTypeIds?.length) {
      const listingTypeIds = [
        ...new Set(filter.listingTypeIds.flatMap((id) => expandListingTypeIdFilter(id))),
      ];
      results = results.filter((l) => listingTypeIds.includes(l.listingTypeId));
    } else if (filter.listingTypeId) {
      const listingTypeIds = expandListingTypeIdFilter(filter.listingTypeId);
      results = results.filter((l) => listingTypeIds.includes(l.listingTypeId));
    }
    if (filter.subcategoryId) results = results.filter((l) => l.subcategoryId === filter.subcategoryId);
    if (filter.moduleKey) results = results.filter((l) => l.moduleKey === filter.moduleKey);
    if (filter.companyId) results = results.filter((l) => l.companyId === filter.companyId);
    if (filter.city) results = results.filter((l) => listingMatchesCityFilter(l, filter.city!));
    if (filter.district) results = results.filter((l) => l.district === filter.district);
    if (filter.industry) results = results.filter((l) => l.industry === filter.industry);
    if (filter.anonymousMode !== undefined) results = results.filter((l) => l.anonymousMode === filter.anonymousMode);
    if (filter.workflowStatus) results = results.filter((l) => l.workflowStatus === filter.workflowStatus);
    if (filter.isVerified !== undefined) results = results.filter((l) => l.isVerified === filter.isVerified);
    if (filter.isFeatured !== undefined) results = results.filter((l) => l.isFeatured === filter.isFeatured);
    if (filter.isUrgent !== undefined) results = results.filter((l) => l.isUrgent === filter.isUrgent);
    if (filter.activeFeaturedOnly) {
      const now = Date.now();
      results = results.filter(
        (l) => Boolean(l.featuredUntil) && new Date(l.featuredUntil!).getTime() > now,
      );
    }
    if (filter.activeUrgentOnly) {
      const now = Date.now();
      results = results.filter(
        (l) => Boolean(l.urgentUntil) && new Date(l.urgentUntil!).getTime() > now,
      );
    }
    if (filter.publishedAfter) {
      const after = new Date(filter.publishedAfter).getTime();
      results = results.filter((l) => {
        const published = l.publishedAt ?? l.createdAt;
        return published ? new Date(published).getTime() >= after : false;
      });
    }
    if (filter.publishedBefore) {
      const before = new Date(filter.publishedBefore).getTime();
      results = results.filter((l) => {
        const published = l.publishedAt ?? l.createdAt;
        return published ? new Date(published).getTime() <= before : false;
      });
    }
    if (filter.remotePolicy) results = results.filter((l) => l.remotePolicy === filter.remotePolicy);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((l) => statuses.includes(l.status));
    }
    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      const numberHex = parseListingNumberQuery(filter.query);
      results = results.filter((l) => {
        if (l.title.toLowerCase().includes(q) || l.shortDescription.toLowerCase().includes(q)) {
          return true;
        }
        if (numberHex && l.id.replace(/-/g, '').toLowerCase().startsWith(numberHex)) {
          return true;
        }
        return formatListingNumber(l.id).toLowerCase().includes(q);
      });
    }

    results = sortListings(results, filter.sortBy);
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany(filter, pagination);
  }

  async findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return this.findMany({ ...filter, status: 'published' }, pagination);
  }

  async count(filter: ListingFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: ListingId): Promise<boolean> {
    return this.listings.has(id);
  }

  async create(input: CreateListingInput): Promise<Listing> {
    const slug = this.uniqueSlug(input.title);
    const listing = createListing({ ...input, slug, status: input.status ?? 'draft' });
    this.save(listing);
    return listing;
  }

  async update(id: ListingId, input: UpdateListingInput): Promise<Listing> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Listing', id);
    const updated: Listing = { ...existing, ...input, updatedAt: now() };
    this.save(updated);
    return updated;
  }

  async softDelete(id: ListingId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
    const listing = this.listings.get(id)!;
    this.save({ ...listing, deletedAt: now() });
  }

  async delete(id: ListingId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: ListingId): Promise<Listing> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    if (!listing.deletedAt) throw new ConflictError('Listing is not deleted');
    const updated: Listing = { ...listing, status: 'draft', deletedAt: null, updatedAt: now() };
    this.save(updated);
    return updated;
  }

  async incrementViewCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    this.save({ ...listing, viewCount: listing.viewCount + 1, updatedAt: now() });
  }

  async incrementApplicationCount(id: ListingId): Promise<void> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    this.save({ ...listing, applicationCount: listing.applicationCount + 1, updatedAt: now() });
  }

  async transitionStatus(id: ListingId, to: ListingStatus): Promise<Listing> {
    const listing = await this.findById(id, { includeDeleted: true });
    if (!listing) throw new NotFoundError('Listing', id);
    if (!canTransition(LISTING_LIFECYCLE, listing.status, to)) {
      throw new InvalidTransitionError(listing.status, to);
    }
    const updated: Listing = {
      ...listing,
      status: to,
      updatedAt: now(),
      publishedAt: to === 'published' ? (listing.publishedAt ?? now()) : listing.publishedAt,
      expiresAt:
        to === 'published'
          ? listing.moduleKey === 'franchise'
            ? computeFranchiseListingExpiry()
            : computeListingExpiry()
          : listing.expiresAt,
      rejectedReason: to === 'pending_review' || to === 'published' ? null : listing.rejectedReason,
    };
    this.save(updated);
    return updated;
  }

  async getAcceptedRequesterContactPhone(id: ListingId): Promise<string | null> {
    const listing = await this.findById(id);
    return listing?.contactPhone?.trim() || null;
  }

  async getAcceptedRequesterOwnerIdentity(id: ListingId): Promise<{
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
  } | null> {
    const listing = await this.findById(id);
    if (!listing) return null;
    return {
      displayName: 'İlan Sahibi',
      firstName: null,
      lastName: null,
      fullName: 'İlan Sahibi',
    };
  }

  /** Internal — save entity and maintain slug index */
  save(listing: Listing): Listing {
    this.listings.set(listing.id, listing);
    this.slugIndex.set(listing.slug, listing.id);
    return listing;
  }

  uniqueSlug(base: string): string {
    let slug = slugify(base);
    let attempt = slug;
    let i = 1;
    while (this.slugIndex.has(attempt)) {
      attempt = `${slug}-${i}`;
      i += 1;
    }
    return attempt;
  }
}

export const mockListingRepository = new MockListingRepository();
