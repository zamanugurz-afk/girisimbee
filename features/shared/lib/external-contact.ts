import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { FranchiseProfileContactFields } from '@/features/profiles/types/franchise-profile.types';
import type { EmployerProfileContactFields } from '@/features/profiles/types/employer-profile.types';
import type { CandidateProfileContactFields } from '@/features/profiles/types/candidate-profile.types';
import type { EntrepreneurProfileContactFields } from '@/features/profiles/types/entrepreneur-profile.types';
import type { InvestorProfileContactFields } from '@/features/profiles/types/investor-profile.types';
import type { FounderProfileContactFields } from '@/features/profiles/types/founder-profile.types';

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

/** External contact from franchise module profile fields (telefon, eposta, website). */
export function contactFromFranchiseProfile(
  profile: Pick<FranchiseProfileContactFields, 'telefon' | 'eposta' | 'website'>,
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: null,
    email: profile.eposta ?? null,
    website: profile.website ?? null,
  };
}

/** External contact from employer module profile fields. */
export function contactFromEmployerProfile(
  profile: Pick<EmployerProfileContactFields, 'telefon' | 'eposta' | 'website' | 'whatsapp'>,
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: profile.whatsapp ?? null,
    email: profile.eposta ?? null,
    website: profile.website ?? null,
  };
}

/** External contact from entrepreneur module profile fields. */
export function contactFromEntrepreneurProfile(
  profile: Pick<EntrepreneurProfileContactFields, 'telefon' | 'eposta'> & { website?: string | null },
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: null,
    email: profile.eposta ?? null,
    website: profile.website ?? null,
  };
}

/** External contact from investor module profile fields. */
export function contactFromInvestorProfile(
  profile: Pick<InvestorProfileContactFields, 'telefon' | 'eposta'> & {
    website?: string | null;
    linkedInUrl?: string | null;
  },
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: null,
    email: profile.eposta ?? null,
    website: profile.website ?? profile.linkedInUrl ?? null,
  };
}

/** External contact from founder module profile fields. */
export function contactFromFounderProfile(
  profile: Pick<FounderProfileContactFields, 'telefon' | 'eposta'> & {
    website?: string | null;
    linkedInUrl?: string | null;
  },
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: null,
    email: profile.eposta ?? null,
    website: profile.website ?? profile.linkedInUrl ?? null,
  };
}

/** External contact from candidate module profile fields. */
export function contactFromCandidateProfile(
  profile: Pick<CandidateProfileContactFields, 'telefon' | 'eposta' | 'whatsapp'> & {
    portfolio?: string | null;
    linkedIn?: string | null;
  },
): ExternalContactInfo {
  return {
    phone: profile.telefon ?? null,
    whatsapp: profile.whatsapp ?? null,
    email: profile.eposta ?? null,
    website: profile.portfolio ?? profile.linkedIn ?? null,
  };
}
