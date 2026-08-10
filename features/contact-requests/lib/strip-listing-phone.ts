import type { Listing } from '@/features/listings/types/listing.entity.types';

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

export function toPublicListingEntity(listing: Listing): Listing {
  return stripListingContactPhone(listing);
}
