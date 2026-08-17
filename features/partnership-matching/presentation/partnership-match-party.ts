import { selectPartnershipDisplayReasons } from '@/features/partnership-matching/explain';
import { normalizePartnershipSource } from '@/features/partnership-matching/normalize';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  PartnershipMatchCard,
  PartnershipMatchDirection,
  PartnershipMatchResult,
} from '@/features/partnership-matching/types';

const CONTACT_FIELD_PATTERN =
  /contactPhone|contactEmail|contactWhatsapp|contactWebsite|ownerId|ownerEmail|ownerPhone/i;

/** Public cards never surface owner identity or private contact channels. */
export function resolvePartnershipMatchPartyLabel(): null {
  return null;
}

export function partnershipListingHref(slug: string): string {
  return `/ilan/${slug}`;
}

export function toPublicPartnershipMatchCard(
  listing: Listing,
  match: PartnershipMatchResult,
): PartnershipMatchCard | null {
  if (!match.recommendable || match.band === 'below_threshold') return null;

  const profile = normalizePartnershipSource(listing);
  const partnershipType = profile.partnershipTypes[0] ?? null;

  return {
    listingId: String(listing.id),
    slug: listing.slug,
    href: partnershipListingHref(listing.slug),
    title: listing.title,
    intent: profile.intent,
    expertise: profile.skills.slice(0, 6),
    sectors: profile.sectors.slice(0, 4),
    experience: profile.experience,
    location: profile.location,
    commitment: profile.commitment,
    partnershipType,
    stage: profile.stage,
    preferredVentureType: profile.intent === 'joining' ? partnershipType : null,
    publishedAt: listing.publishedAt || listing.createdAt || null,
    score: match.score,
    band: match.band,
    bandLabel: match.bandLabel,
    reasons: selectPartnershipDisplayReasons(match.reasons),
  };
}

export function partnershipCardMetaRows(
  card: PartnershipMatchCard,
  direction: PartnershipMatchDirection,
): string[] {
  if (direction === 'partners') {
    return [
      card.expertise.length ? `Uzmanlık: ${card.expertise.join(' · ')}` : null,
      card.sectors.length ? `Sektör: ${card.sectors.join(' · ')}` : null,
      card.experience ? `Deneyim: ${card.experience}` : null,
      card.location ? `Lokasyon: ${card.location}` : null,
      card.commitment ? `Taahhüt: ${card.commitment}` : null,
      card.preferredVentureType ? `Tercih edilen girişim tipi: ${card.preferredVentureType}` : null,
    ].filter((row): row is string => Boolean(row));
  }

  return [
    card.sectors.length ? `Sektör: ${card.sectors.join(' · ')}` : null,
    card.stage ? `Aşama: ${card.stage}` : null,
    card.partnershipType ? `Aranan ortak tipi: ${card.partnershipType}` : null,
    card.expertise.length ? `Aranan uzmanlık: ${card.expertise.join(' · ')}` : null,
    card.location ? `Lokasyon: ${card.location}` : null,
    card.commitment ? `Taahhüt: ${card.commitment}` : null,
  ].filter((row): row is string => Boolean(row));
}

export function assertNoPartnershipContactLeak(value: unknown): void {
  const json = JSON.stringify(value);
  if (!json) return;
  if (CONTACT_FIELD_PATTERN.test(json)) {
    throw new Error('Partnership match result leaked a contact channel field');
  }
  if (json.includes('customFields')) {
    throw new Error('Partnership match result leaked raw customFields');
  }
}
