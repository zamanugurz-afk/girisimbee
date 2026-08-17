import { getExperienceLevelLabel } from '@/features/candidates/taxonomy/career-taxonomy';
import { canonicalWorkModel, normalizeCareerSource } from '@/features/career-profile/normalize';
import { getModuleListingDetailPath } from '@/features/listings/config/listing-category-module.config';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { selectDisplayReasons } from '@/features/matching-engine/explain';
import type { CareerListingKind, CareerMatchCard, CareerMatchProfile, MatchResult } from '@/features/matching-engine/types';

export function listingTypeLabelForKind(kind: CareerListingKind): string {
  return kind === 'seek' ? 'İş Arıyorum' : 'İşe Alıyorum';
}

export function readCareerLocation(listing: Listing): string | null {
  return normalizeCareerSource(listing).city;
}

export function readCareerWorkModel(listing: Listing): string | null {
  return canonicalWorkModel(normalizeCareerSource(listing));
}

export interface CareerMatchCardContext {
  partyLabel?: string | null;
  profile?: CareerMatchProfile | null;
}

/**
 * Public match card — only marketplace-safe fields.
 * Never copies phone, email, WhatsApp, raw customFields, or owner identity.
 */
export function toPublicCareerMatchCard(
  listing: Listing,
  kind: CareerListingKind,
  match: MatchResult,
  context: CareerMatchCardContext = {},
): CareerMatchCard | null {
  if (!match.recommendable || match.band === 'below_threshold') return null;

  const skills = [
    ...(context.profile?.professionalSkills ?? []),
    ...(context.profile?.technicalSkills ?? []),
  ].filter(Boolean);

  const sectorLabel = context.profile?.sector || listing.industry || null;
  const salary = context.profile?.salary || null;

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    href: getModuleListingDetailPath(listing.categoryId, listing.slug),
    title: listing.title,
    listingKind: kind,
    listingTypeLabel: listingTypeLabelForKind(kind),
    partyLabel: context.partyLabel?.trim() || null,
    sectorLabel: sectorLabel?.trim() || null,
    experienceLabel: getExperienceLevelLabel(context.profile?.experienceLevel) || null,
    highlightSkills: [...new Set(skills)].slice(0, 4),
    location: readCareerLocation(listing),
    workModel: readCareerWorkModel(listing),
    salary: salary?.trim() || null,
    publishedAt: listing.publishedAt || listing.createdAt || null,
    score: match.score,
    band: match.band as Exclude<typeof match.band, 'below_threshold'>,
    bandLabel: match.bandLabel,
    reasons: selectDisplayReasons(match.reasons),
  };
}

export function assertNoContactLeak(value: unknown): void {
  const json = JSON.stringify(value);
  if (!json) return;
  if (/"contactPhone"|"contactEmail"|"contactWhatsapp"|"contactWebsite"/.test(json)) {
    throw new Error('Matching result leaked a contact channel field');
  }
}
