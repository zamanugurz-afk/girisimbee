/**
 * Row mappers for marketplace_listings table.
 */
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import type { Listing, ListingStatus, RemotePolicy } from '@/features/listings/types/listing.entity.types';
import type { ListingId, UserId, CompanyId, CategoryId, ListingTypeId } from '@/lib/domain/ids';

export interface ListingRow {
  id: string;
  slug: string;
  owner_id: string;
  company_id: string | null;
  category_id: string;
  listing_type_id: string;
  title: string;
  short_description: string;
  long_description: string;
  status: string;
  location: string | null;
  city: string | null;
  country: string;
  remote_policy: string | null;
  custom_fields: Record<string, unknown>;
  view_count: number;
  interested_count: number;
  application_count: number;
  is_verified: boolean;
  is_featured: boolean;
  published_at: string | null;
  expires_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function mapListingRow(row: ListingRow): Listing {
  return {
    id: row.id as ListingId,
    slug: row.slug,
    ownerId: row.owner_id as UserId,
    companyId: row.company_id as CompanyId | null,
    categoryId: row.category_id as CategoryId,
    listingTypeId: row.listing_type_id as ListingTypeId,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    status: row.status as ListingStatus,
    location: row.location,
    city: row.city,
    country: row.country,
    remotePolicy: row.remote_policy as RemotePolicy | null,
    investmentDetails: null,
    jobDetails: null,
    partnerDetails: null,
    customFields: row.custom_fields ?? {},
    viewCount: row.view_count,
    interestedCount: row.interested_count,
    applicationCount: row.application_count,
    isVerified: row.is_verified,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    rejectedReason: row.rejected_reason,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export function toListingRow(
  listing: Partial<Listing> & Pick<Listing, 'ownerId' | 'categoryId' | 'listingTypeId' | 'title' | 'shortDescription' | 'slug'>,
): Record<string, unknown> {
  return {
    slug: listing.slug,
    owner_id: listing.ownerId,
    company_id: listing.companyId ?? null,
    category_id: listing.categoryId,
    listing_type_id: listing.listingTypeId,
    title: listing.title,
    short_description: listing.shortDescription,
    long_description: listing.longDescription ?? '',
    status: listing.status ?? 'draft',
    location: listing.location ?? null,
    city: listing.city ?? null,
    country: listing.country ?? 'TR',
    remote_policy: listing.remotePolicy ?? null,
    custom_fields: listing.customFields ?? {},
    view_count: listing.viewCount ?? 0,
    interested_count: listing.interestedCount ?? 0,
    application_count: listing.applicationCount ?? 0,
    is_verified: listing.isVerified ?? false,
    is_featured: listing.isFeatured ?? false,
    published_at: listing.publishedAt ?? null,
    expires_at: listing.expiresAt ?? null,
    rejected_reason: listing.rejectedReason ?? null,
  };
}

export function toListingUpdateRow(input: Partial<Listing>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.companyId !== undefined) row.company_id = input.companyId;
  if (input.title !== undefined) row.title = input.title;
  if (input.shortDescription !== undefined) row.short_description = input.shortDescription;
  if (input.longDescription !== undefined) row.long_description = input.longDescription;
  if (input.status !== undefined) row.status = input.status;
  if (input.location !== undefined) row.location = input.location;
  if (input.city !== undefined) row.city = input.city;
  if (input.country !== undefined) row.country = input.country;
  if (input.remotePolicy !== undefined) row.remote_policy = input.remotePolicy;
  if (input.customFields !== undefined) row.custom_fields = input.customFields;
  if (input.viewCount !== undefined) row.view_count = input.viewCount;
  if (input.interestedCount !== undefined) row.interested_count = input.interestedCount;
  if (input.applicationCount !== undefined) row.application_count = input.applicationCount;
  if (input.isVerified !== undefined) row.is_verified = input.isVerified;
  if (input.isFeatured !== undefined) row.is_featured = input.isFeatured;
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt;
  if (input.expiresAt !== undefined) row.expires_at = input.expiresAt;
  if (input.rejectedReason !== undefined) row.rejected_reason = input.rejectedReason;
  if (input.deletedAt !== undefined) row.deleted_at = input.deletedAt;
  return row;
}
