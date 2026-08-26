import { extractFounderListingDetails } from '@/features/founders/lib/founder-listing.mapper';
import { resolvePartnershipIntent, type PartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  expandCategoryIdFilter,
  expandListingTypeIdFilter,
  MARKETPLACE_CATEGORY_IDS,
  MARKETPLACE_LISTING_TYPE_IDS,
  resolveListingTypeIdsFromBrowseSlug,
} from '@/features/listings/config/marketplace-category-map';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type {
  PartnershipMatchCompletionSummary,
  PartnershipMatchProfile,
  ResolvedPartnershipSource,
} from '@/features/partnership-matching/types';

const PARTNERSHIP_TYPE_ALIASES: Record<string, string> = {
  technical: 'Teknik Ortak',
  'teknik ortak': 'Teknik Ortak',
  teknik: 'Teknik Ortak',
  business: 'İş Ortağı',
  'iş ortağı': 'İş Ortağı',
  'is ortagi': 'İş Ortağı',
  'co_founder': 'Kurucu Ortak',
  'co-founder': 'Kurucu Ortak',
  cofounder: 'Kurucu Ortak',
  'kurucu ortak': 'Kurucu Ortak',
  kurucu: 'Kurucu Ortak',
  advisor: 'Danışman',
  danışman: 'Danışman',
  danisman: 'Danışman',
};

const COMMITMENT_ALIASES: Record<string, string> = {
  'tam zamanlı': 'Tam zamanlı',
  'tam zamanli': 'Tam zamanlı',
  full_time: 'Tam zamanlı',
  'full-time': 'Tam zamanlı',
  'full time': 'Tam zamanlı',
  'yarı zamanlı': 'Yarı zamanlı',
  'yari zamanli': 'Yarı zamanlı',
  part_time: 'Yarı zamanlı',
  'part-time': 'Yarı zamanlı',
  'part time': 'Yarı zamanlı',
  danışmanlık: 'Danışmanlık',
  danismanlik: 'Danışmanlık',
  advisor: 'Danışmanlık',
  consultancy: 'Danışmanlık',
};

const STAGE_ALIASES: Record<string, string> = {
  fikir: 'Fikir aşaması',
  'fikir aşaması': 'Fikir aşaması',
  'fikir asaması': 'Fikir aşaması',
  mvp: 'MVP aşaması',
  'mvp aşaması': 'MVP aşaması',
  'ilk müşteriler': 'İlk müşteriler',
  'ilk musteriler': 'İlk müşteriler',
  'gelir elde ediliyor': 'Gelir elde ediliyor',
  büyüme: 'Büyüme aşaması',
  'büyüme aşaması': 'Büyüme aşaması',
  'buyume asaması': 'Büyüme aşaması',
  ölçeklenme: 'Ölçeklenme aşaması',
  'ölçeklenme aşaması': 'Ölçeklenme aşaması',
  'olcekleme asaması': 'Ölçeklenme aşaması',
  'tüm aşamalar': 'Tüm aşamalar',
  'tum asamalar': 'Tüm aşamalar',
};

function uniqueIds<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function partnershipToken(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR');
}

export function uniquePartnershipTokens(values?: readonly string[] | null): string[] {
  if (!values || !Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = partnershipToken(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value.trim());
  }
  return out;
}

function asStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(asStringList);
  if (typeof value === 'string') {
    return value
      .split(/[,;·|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function readCustom(listing: Listing, key: string): unknown {
  return listing.customFields?.[key];
}

function canonicalPartnershipType(value: string | null | undefined): string | null {
  const raw = firstText(value);
  if (!raw) return null;
  const key = partnershipToken(raw);
  return PARTNERSHIP_TYPE_ALIASES[key] ?? raw;
}

function canonicalCommitment(value: string | null | undefined): string | null {
  const raw = firstText(value);
  if (!raw) return null;
  const key = partnershipToken(raw);
  return COMMITMENT_ALIASES[key] ?? raw;
}

function canonicalStage(value: string | null | undefined): string | null {
  const raw = firstText(value);
  if (!raw) return null;
  const key = partnershipToken(raw);
  return STAGE_ALIASES[key] ?? raw;
}

export function parsePartnershipEquity(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }
  if (typeof value !== 'string') return null;
  const match = value.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(100, parsed));
}

export function getPartnershipListingTypeIds(): ListingTypeId[] {
  return uniqueIds([
    ...expandListingTypeIdFilter(LISTING_TYPE_IDS.ortakBulDefault),
    ...expandListingTypeIdFilter(MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum),
    ...resolveListingTypeIdsFromBrowseSlug('ortak-bul'),
  ]);
}

export function getPartnershipCategoryIds(): CategoryId[] {
  return uniqueIds([
    ...expandCategoryIdFilter(CATEGORY_IDS.ortakBul),
    MARKETPLACE_CATEGORY_IDS.ortaklik,
  ]);
}

export function isPartnershipListing(listing: Pick<Listing, 'categoryId' | 'listingTypeId' | 'moduleKey'>): boolean {
  if (listing.moduleKey === 'founders') return true;
  if (getPartnershipCategoryIds().includes(listing.categoryId)) return true;
  return getPartnershipListingTypeIds().includes(listing.listingTypeId);
}

export function resolvePartnershipSource(listing: Listing): ResolvedPartnershipSource {
  const details = extractFounderListingDetails(listing);
  const intent = resolvePartnershipIntent({
    customFields: listing.customFields,
    partnershipIntent: details.partnershipIntent,
  });

  return {
    intent,
    title: listing.title.trim(),
    description: (listing.shortDescription || listing.longDescription || '').trim(),
    expertise: uniquePartnershipTokens([
      ...asStringList(details.expertise),
      ...asStringList(details.professionalSkills),
      ...asStringList(details.technicalSkills),
      ...asStringList(details.tools),
      ...asStringList(details.expertiseOther),
      ...asStringList(details.professionalSkillsOther),
      ...asStringList(details.technicalSkillsOther),
      ...asStringList(details.toolsOther),
    ]),
    requiredSkills: uniquePartnershipTokens(asStringList(details.requiredSkills)),
    offeredSkills: uniquePartnershipTokens(asStringList(details.offeredSkills)),
    sectors: uniquePartnershipTokens([
      ...asStringList(details.sectors),
      ...asStringList(details.sector),
      ...asStringList(listing.industry),
    ]),
    partnershipTypes: uniquePartnershipTokens(
      [
        ...asStringList(details.partnershipTypes),
        canonicalPartnershipType(details.partnershipType),
        canonicalPartnershipType(firstText(readCustom(listing, 'preferredPartnershipType'))),
        canonicalPartnershipType(listing.partnerDetails?.partnerType),
        ...asStringList(details.partnershipTypesOther),
        ...asStringList(details.partnershipTypeOther),
      ].filter((value): value is string => Boolean(value)),
    ),
    commitment: canonicalCommitment(details.commitment ?? listing.partnerDetails?.commitment),
    stage: canonicalStage(
      firstText(
        details.projectStage,
        details.startupStage,
        readCustom(listing, 'preferredStartupStage'),
      ),
    ),
    experience: firstText(details.experience),
    location: firstText(listing.city, listing.location),
    equityRaw: details.equityOffered ?? listing.partnerDetails?.equityOffered ?? null,
  };
}

export function normalizePartnershipSource(listing: Listing): PartnershipMatchProfile {
  const resolved = resolvePartnershipSource(listing);
  const skills =
    resolved.intent === 'joining'
      ? uniquePartnershipTokens([...resolved.expertise, ...resolved.offeredSkills])
      : uniquePartnershipTokens([...resolved.expertise, ...resolved.requiredSkills]);

  return {
    intent: resolved.intent,
    title: resolved.title,
    description: resolved.description,
    skills,
    sectors: resolved.sectors,
    partnershipTypes: resolved.partnershipTypes,
    commitment: resolved.commitment,
    stage: resolved.stage,
    experience: resolved.experience,
    location: resolved.location,
    equity: parsePartnershipEquity(resolved.equityRaw),
  };
}

const SEEKING_COMPLETION: Array<{ key: keyof PartnershipMatchProfile; label: string; present: (profile: PartnershipMatchProfile) => boolean }> = [
  { key: 'title', label: 'Başlık', present: (profile) => Boolean(profile.title) },
  { key: 'sectors', label: 'Sektör', present: (profile) => profile.sectors.length > 0 },
  { key: 'partnershipTypes', label: 'Ortaklık tipi', present: (profile) => profile.partnershipTypes.length > 0 },
  { key: 'skills', label: 'Uzmanlık', present: (profile) => profile.skills.length > 0 },
  { key: 'commitment', label: 'Taahhüt', present: (profile) => Boolean(profile.commitment) },
];

const JOINING_COMPLETION: Array<{ key: keyof PartnershipMatchProfile; label: string; present: (profile: PartnershipMatchProfile) => boolean }> = [
  { key: 'title', label: 'Başlık', present: (profile) => Boolean(profile.title) },
  { key: 'skills', label: 'Uzmanlık', present: (profile) => profile.skills.length > 0 },
  { key: 'sectors', label: 'Sektör', present: (profile) => profile.sectors.length > 0 },
  { key: 'partnershipTypes', label: 'Ortaklık tipi', present: (profile) => profile.partnershipTypes.length > 0 },
  { key: 'commitment', label: 'Taahhüt', present: (profile) => Boolean(profile.commitment) },
];

export function calculatePartnershipProfileCompletion(
  listing: Listing,
): PartnershipMatchCompletionSummary {
  const profile = normalizePartnershipSource(listing);
  const fields = profile.intent === 'joining' ? JOINING_COMPLETION : SEEKING_COMPLETION;
  const missingLabels = fields.filter((field) => !field.present(profile)).map((field) => field.label);
  const filled = fields.length - missingLabels.length;
  const percent = Math.round((filled / fields.length) * 100);

  return {
    intent: profile.intent,
    listingId: String(listing.id),
    percent,
    complete: missingLabels.length === 0,
    missingLabels,
  };
}

export function oppositePartnershipIntent(intent: PartnershipIntent): PartnershipIntent {
  return intent === 'seeking' ? 'joining' : 'seeking';
}
