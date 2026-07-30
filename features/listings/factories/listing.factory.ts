import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable, slugify } from '@/lib/domain/factory';
import type { Listing, CreateListingInput } from '@/features/listings/types/listing.entity.types';

export function createListing(
  overrides: Partial<Listing> & Pick<Listing, 'ownerId' | 'categoryId' | 'listingTypeId' | 'title' | 'shortDescription'>,
): Listing {
  const ts = timestamps(overrides.createdAt);
  const slug = overrides.slug ?? slugify(overrides.title);
  return {
    id: overrides.id ?? ids.listing(crypto.randomUUID()),
    slug,
    ownerId: overrides.ownerId,
    companyId: overrides.companyId ?? null,
    categoryId: overrides.categoryId,
    listingTypeId: overrides.listingTypeId,
    title: overrides.title,
    shortDescription: overrides.shortDescription,
    longDescription: overrides.longDescription ?? '',
    status: overrides.status ?? 'draft',
    location: overrides.location ?? null,
    city: overrides.city ?? null,
    country: overrides.country ?? 'TR',
    remotePolicy: overrides.remotePolicy ?? null,
    investmentDetails: overrides.investmentDetails ?? null,
    jobDetails: overrides.jobDetails ?? null,
    partnerDetails: overrides.partnerDetails ?? null,
    customFields: overrides.customFields ?? {},
    viewCount: overrides.viewCount ?? 0,
    interestedCount: overrides.interestedCount ?? 0,
    applicationCount: overrides.applicationCount ?? 0,
    isVerified: overrides.isVerified ?? false,
    isFeatured: overrides.isFeatured ?? false,
    publishedAt: overrides.publishedAt ?? null,
    expiresAt: overrides.expiresAt ?? null,
    rejectedReason: overrides.rejectedReason ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createListingInput(overrides: Partial<CreateListingInput> = {}): CreateListingInput {
  return {
    ownerId: overrides.ownerId ?? ids.user(crypto.randomUUID()),
    categoryId: overrides.categoryId ?? ids.category(crypto.randomUUID()),
    listingTypeId: overrides.listingTypeId ?? ids.listingType(crypto.randomUUID()),
    title: overrides.title ?? 'Test İlanı',
    shortDescription: overrides.shortDescription ?? 'Bu bir test ilanıdır. Minimum yirmi karakter gereklidir.',
    companyId: overrides.companyId,
    longDescription: overrides.longDescription,
    location: overrides.location,
    investmentDetails: overrides.investmentDetails,
    jobDetails: overrides.jobDetails,
    partnerDetails: overrides.partnerDetails,
    customFields: overrides.customFields,
  };
}
