/**
 * In-memory listing store — backward-compatible facade over mock repositories.
 * @deprecated Use lib/persistence container and repository implementations directly.
 */
import { slugify } from '@/lib/domain/factory';
import type { ListingId, UserId } from '@/lib/domain/ids';
import type { Listing, ListingFilter, ListingStatus } from '@/features/listings/types/listing.entity.types';
import type { Tag } from '@/features/listings/types/tag.types';
import type { Attachment } from '@/features/listings/types/attachment.types';
import type { ListingImage } from '@/features/listings/types/listing-engine.types';
import type { Activity } from '@/features/shared/types/activity.types';
import { createListing } from '@/features/listings/factories/listing.factory';
import { mockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { mockTagRepository } from '@/features/listings/repository/mock/tag.repository.mock';
import { mockListingImageRepository } from '@/features/listings/repository/mock/listing-image.repository.mock';
import { mockActivityRepository } from '@/features/shared/repository/mock/activity.repository.mock';

/** @deprecated Use mockListingRepository or SupabaseListingRepository */
class ListingStore {
  save(listing: Listing): Listing {
    return mockListingRepository.save(listing);
  }

  findById(id: ListingId, includeDeleted = false) {
    return mockListingRepository.findById(id, { includeDeleted });
  }

  findBySlug(slug: string) {
    return mockListingRepository.findBySlug(slug);
  }

  async findMany(filter: ListingFilter, page = 1, limit = 20) {
    const result = await mockListingRepository.findMany(filter, { page, limit });
    return { data: result.data, total: result.total };
  }

  transitionStatus(id: ListingId, to: ListingStatus) {
    return mockListingRepository.transitionStatus(id, to);
  }

  softDelete(id: ListingId) {
    return mockListingRepository.softDelete(id);
  }

  restore(id: ListingId) {
    return mockListingRepository.restore(id);
  }

  uniqueSlug(base: string): string {
    return mockListingRepository.uniqueSlug(base);
  }

  findOrCreateTag(name: string): Tag {
    return mockTagRepository.findOrCreateByName(name) as unknown as Tag;
  }

  getTagsForListing(listingId: ListingId): Tag[] {
    return mockTagRepository.findByListingId(listingId) as unknown as Tag[];
  }

  setTagsForListing(listingId: ListingId, tagNames: string[]): Tag[] {
    return mockTagRepository.setTagsForListing(listingId, tagNames) as unknown as Tag[];
  }

  getImages(listingId: ListingId): ListingImage[] {
    return mockListingImageRepository.findByListingId(listingId) as unknown as ListingImage[];
  }

  setImages(listingId: ListingId, images: Omit<ListingImage, 'id' | 'listingId'>[]): ListingImage[] {
    return mockListingImageRepository.setForListing(listingId, images) as unknown as ListingImage[];
  }

  getAttachments(_listingId: ListingId): Attachment[] {
    return [];
  }

  addActivity(listingId: ListingId, input: {
    verb: Activity['verb'];
    actorId: UserId | null;
    summary: string;
    metadata?: Record<string, unknown>;
    isPublic?: boolean;
  }): Activity {
    return mockActivityRepository.create({
      verb: input.verb,
      entityType: 'listing',
      entityId: listingId,
      summary: input.summary,
      actorId: input.actorId,
      metadata: input.metadata ?? {},
      isPublic: input.isPublic ?? false,
    }) as unknown as Activity;
  }

  getActivities(listingId: ListingId): Activity[] {
    return mockActivityRepository.findByEntity('listing', listingId) as unknown as Activity[];
  }
}

export const listingStore = new ListingStore();

export function getListingStore(): ListingStore {
  return listingStore;
}

/** Build a new listing entity from payload */
export function buildListingEntity(params: {
  ownerId: UserId;
  categoryId: Listing['categoryId'];
  listingTypeId: Listing['listingTypeId'];
  title: string;
  shortDescription: string;
  longDescription?: string;
  location?: string | null;
  city?: string | null;
  country?: string;
  remotePolicy?: Listing['remotePolicy'];
  companyId?: Listing['companyId'];
  customFields: Record<string, unknown>;
  slug?: string;
}): Listing {
  const slug = params.slug ?? mockListingRepository.uniqueSlug(params.title);
  return createListing({
    ownerId: params.ownerId,
    categoryId: params.categoryId,
    listingTypeId: params.listingTypeId,
    title: params.title,
    shortDescription: params.shortDescription,
    slug,
    longDescription: params.longDescription ?? '',
    location: params.location ?? null,
    city: params.city ?? null,
    country: params.country ?? 'TR',
    remotePolicy: params.remotePolicy ?? null,
    companyId: params.companyId ?? null,
    customFields: params.customFields,
    status: 'draft',
    investmentDetails: null,
    jobDetails: null,
    partnerDetails: null,
  });
}

export { slugify };
