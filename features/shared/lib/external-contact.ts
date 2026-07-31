import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { Profile } from '@/features/profiles/types/profile.types';

/** Extract v1 external contact channels from a listing (no internal messaging). */
export function contactFromListing(listing: Listing): ExternalContactInfo {
  return {
    phone: listing.contactPhone,
    whatsapp: listing.contactWhatsapp,
    email: listing.contactEmail,
    website: listing.contactWebsite,
  };
}

/** Fallback contact from profile when listing has no contact fields. */
export function contactFromProfile(profile: Profile): ExternalContactInfo {
  return {
    phone: profile.phone ?? null,
    whatsapp: null,
    email: profile.email ?? null,
    website: profile.website ?? null,
  };
}

export function hasExternalContact(contact: ExternalContactInfo): boolean {
  return Boolean(contact.phone || contact.whatsapp || contact.email || contact.website);
}
