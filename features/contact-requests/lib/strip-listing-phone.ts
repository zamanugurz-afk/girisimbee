import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { UserId } from '@/lib/domain/ids';
import {
  isIdentityGatedListing,
  sanitizeIdentityGatedCustomFields,
} from '@/features/contact-requests/lib/contact-disclosure';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  resolveCareerCoverRole,
  resolveListingCoverUrl,
} from '@/features/listings/config/listing-cover.config';

type ContactChannelFields = {
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
};

/**
 * Public listing DTO sanitizer — never expose direct contact channels publicly.
 * Contact flow: request → owner approval → messaging + phone reveal (requester+listing scoped).
 */
export function stripListingContactPhone<T extends ContactChannelFields>(listing: T): T {
  return {
    ...listing,
    contactPhone: null,
    contactWhatsapp: null,
    contactEmail: null,
  };
}

export function stripListingsContactPhone<T extends ContactChannelFields>(listings: T[]): T[] {
  return listings.map(stripListingContactPhone);
}

/**
 * Public marketplace listing entity:
 * - always strips direct contact channels
 * - for identity-gated (candidates / anonymousMode): strips owner/company ids and
 *   identity-shaped custom_fields while keeping anonymous career facts
 *
 * Server internals (loader, contact-request, ownership) must use repository rows
 * before this sanitizer — accepted disclosure RPCs are unchanged.
 */
function resolvePublicCareerCoverUrl(listing: Listing): string | null {
  const listingTypeSlug =
    (listing as Listing & { listingTypeSlug?: string | null }).listingTypeSlug
    ?? categoryRegistry.getListingType(listing.listingTypeId)?.slug
    ?? null;
  if (listingTypeSlug !== 'is-ariyorum' && listingTypeSlug !== 'is-bul') return null;
  const cf = listing.customFields ?? {};
  return resolveListingCoverUrl({
    listingTypeSlug,
    sector: typeof cf.primarySector === 'string' ? cf.primarySector : null,
    role: resolveCareerCoverRole(
      typeof cf.desiredRole === 'string' ? cf.desiredRole : null,
      typeof cf.desiredRoleOther === 'string' ? cf.desiredRoleOther : null,
    ),
    gender: typeof cf.profileGender === 'string' ? cf.profileGender : null,
  });
}

export function toPublicListingEntity(listing: Listing): Listing {
  const base = stripListingContactPhone(listing);
  if (!isIdentityGatedListing(base)) {
    return base;
  }

  const resolvedCoverUrl = resolvePublicCareerCoverUrl(listing);
  const publicListing: Listing = {
    ...base,
    companyId: null,
    contactWebsite: null,
    customFields: {
      ...sanitizeIdentityGatedCustomFields(base.customFields),
      ...(resolvedCoverUrl ? { resolvedCoverUrl } : {}),
    },
  };
  // Omit ownerId from JSON / public consumers (listingId remains for SEO/detail).
  delete (publicListing as { ownerId?: UserId }).ownerId;
  return publicListing;
}

export function toPublicListingEntities(listings: Listing[]): Listing[] {
  return listings.map(toPublicListingEntity);
}
