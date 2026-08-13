import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { UserId } from '@/lib/domain/ids';
import {
  isIdentityGatedListing,
  sanitizeIdentityGatedCustomFields,
} from '@/features/contact-requests/lib/contact-disclosure';

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
export function toPublicListingEntity(listing: Listing): Listing {
  const base = stripListingContactPhone(listing);
  if (!isIdentityGatedListing(base)) {
    return base;
  }

  const publicListing: Listing = {
    ...base,
    companyId: null,
    contactWebsite: null,
    customFields: sanitizeIdentityGatedCustomFields(base.customFields),
  };
  // Omit ownerId from JSON / public consumers (listingId remains for SEO/detail).
  delete (publicListing as { ownerId?: UserId }).ownerId;
  return publicListing;
}

export function toPublicListingEntities(listings: Listing[]): Listing[] {
  return listings.map(toPublicListingEntity);
}
