import type { ModuleKey } from '@/lib/domain/modules';
import type { ContactRequestStatus } from '@/features/contact-requests/types/contact-request.types';

/** Listings that hide owner/publisher identity until an accepted contact request. */
export function isIdentityGatedListing(listing: {
  moduleKey?: ModuleKey | string | null;
  anonymousMode?: boolean | null;
}): boolean {
  if (listing.anonymousMode === true) return true;
  return listing.moduleKey === 'candidates';
}

export type ContactDisclosureInput = {
  listing: {
    moduleKey?: ModuleKey | string | null;
    anonymousMode?: boolean | null;
    ownerId: string;
  };
  viewerUserId?: string | null;
  /** When true, treat viewer as admin/super_admin (existing RBAC). */
  viewerIsAdmin?: boolean;
  /** True when viewer has an accepted contact request for this listing. */
  hasAcceptedContactRequest?: boolean;
};

export type ContactDisclosureDecision = {
  /** Listing uses accept-gated identity (career / anonymous). */
  identityGated: boolean;
  /** Viewer may see owner display name / profile / company identity. */
  canRevealOwnerIdentity: boolean;
  /**
   * Viewer may receive owner contact channels via accepted-requester RPCs
   * (or as owner/admin). Public listing detail still never embeds channels.
   */
  canRevealOwnerContactChannels: boolean;
};

/**
 * Central authorization for owner identity / contact disclosure.
 * Does not call RPCs — callers pass accepted-request / admin flags.
 */
export function resolveContactDisclosure(
  input: ContactDisclosureInput,
): ContactDisclosureDecision {
  const identityGated = isIdentityGatedListing(input.listing);
  const viewerId = input.viewerUserId?.trim() || null;
  const isOwner = Boolean(viewerId && viewerId === input.listing.ownerId);
  const isAdmin = input.viewerIsAdmin === true;
  const accepted = input.hasAcceptedContactRequest === true;

  if (!identityGated) {
    // Non-career marketplace listings keep public publisher identity.
    // Contact channels remain accept/owner gated elsewhere.
    return {
      identityGated: false,
      canRevealOwnerIdentity: true,
      canRevealOwnerContactChannels: isOwner || isAdmin || accepted,
    };
  }

  const privileged = isOwner || isAdmin || accepted;
  return {
    identityGated: true,
    canRevealOwnerIdentity: privileged,
    canRevealOwnerContactChannels: privileged,
  };
}

/** Service-layer gate: only accepted rows may attach owner PII to requester views. */
export function shouldRevealAcceptedOwnerPii(
  effectiveStatus: ContactRequestStatus,
): boolean {
  return effectiveStatus === 'accepted';
}

export const ANONYMOUS_PROFILE_LABEL = 'Anonim Profil';

/**
 * custom_fields keys that can identify employer/person on public career cards.
 * Career facts (role, skills, education, experiences shape, etc.) are kept.
 */
export const IDENTITY_GATED_CUSTOM_FIELD_KEYS = [
  'companyName',
  'company',
  'companyUrl',
  'companyLogo',
  'logoUrl',
  'website',
  'employer',
  'employerName',
  'organization',
  'firma',
  'cvUrl',
  'firstName',
  'lastName',
  'displayName',
  'fullName',
  'email',
  'phone',
  'contactPhone',
  'contactEmail',
  'contactWhatsapp',
  'whatsapp',
  'profileId',
  'userId',
  'ownerId',
] as const;

const IDENTITY_GATED_CUSTOM_FIELD_KEY_SET = new Set<string>(
  IDENTITY_GATED_CUSTOM_FIELD_KEYS,
);

/** Strip employer/company-shaped keys from career experience rows (defense in depth). */
export function redactCareerExperiencePublicFields(
  experiences: unknown,
): unknown {
  if (!Array.isArray(experiences)) return experiences;
  return experiences.map((row) => {
    if (!row || typeof row !== 'object') return row;
    const r = { ...(row as Record<string, unknown>) };
    delete r.company;
    delete r.companyName;
    delete r.employer;
    delete r.employerName;
    delete r.organization;
    delete r.firma;
    delete r.companyUrl;
    delete r.website;
    delete r.logoUrl;
    return r;
  });
}

/** Keep anonymous career facts; drop identity / employer-shaped custom fields. */
export function sanitizeIdentityGatedCustomFields(
  customFields: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const source = customFields ?? {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (IDENTITY_GATED_CUSTOM_FIELD_KEY_SET.has(key)) continue;
    if (key === 'kvkkConsents') continue;
    if (key === 'experiences') {
      out[key] = redactCareerExperiencePublicFields(value);
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * True when the member's published presence is only identity-gated (career /
 * anonymous) listings — `/uye/[userId]` must not reveal real identity.
 * Members with any non-gated published listing keep normal public profile behavior.
 */
export function shouldBlockPublicMemberProfileEnumeration(
  publishedListings: Array<{
    moduleKey?: ModuleKey | string | null;
    anonymousMode?: boolean | null;
  }>,
): boolean {
  if (publishedListings.length === 0) return false;
  return publishedListings.every((listing) => isIdentityGatedListing(listing));
}
