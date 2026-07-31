import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { ListingDetail, ListingPublisher } from '@/features/listings/types/listing.types';
import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { Company } from '@/features/companies/types/company.types';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  CATEGORY_EMOJI,
  CATEGORY_PAGE_CONFIG,
  INTENT_TO_CATEGORY_SLUG,
} from '@/features/listings/config/marketplace.config';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge, trustFromCompany, trustFromProfile } from '@/features/authentication/types/trust.types';
import { isEmptyDisplayValue, toDisplayValue } from '@/features/listings/utils/display-value';
import {
  INVESTOR_FIELD_SCHEMA,
  HIRING_FIELD_SCHEMA,
  JOB_SEEKER_FIELD_SCHEMA,
  PARTNER_FIELD_SCHEMA,
  SEEKING_INVESTMENT_FIELD_SCHEMA,
} from '@/features/listings/config/listing-type-config';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';

const SLUG_TO_INTENT = Object.fromEntries(
  Object.entries(INTENT_TO_CATEGORY_SLUG).map(([intent, slug]) => [slug, intent]),
) as Record<string, CategoryIntentId>;

const CATEGORY_FIELD_SCHEMAS: Record<string, ListingFieldSchema> = {
  'yatirim-bul': SEEKING_INVESTMENT_FIELD_SCHEMA,
  'yatirim-yap': INVESTOR_FIELD_SCHEMA,
  'is-bul': JOB_SEEKER_FIELD_SCHEMA,
  'ise-al': HIRING_FIELD_SCHEMA,
  'ortak-bul': PARTNER_FIELD_SCHEMA,
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildCustomFacts(
  categorySlug: string,
  customFields: Record<string, unknown>,
): { label: string; value: string }[] {
  const schema = CATEGORY_FIELD_SCHEMAS[categorySlug];
  if (!schema) return [];

  return schema.fields
    .map((field) => ({
      label: field.label,
      value: toDisplayValue(customFields[field.key]),
    }))
    .filter((row) => row.value.length > 0);
}

/** Map engine aggregate → UI ListingDetail (existing detail view). */
export function aggregateToListingDetail(
  aggregate: ListingAggregate,
  context?: { profile?: Profile | null; company?: Company | null },
): ListingDetail {
  const { listing, tags, images, activityHistory } = aggregate;
  const category = categoryRegistry.getCategory(listing.categoryId);
  const categorySlug = category?.slug ?? 'yatirim-bul';
  const meta = CATEGORY_PAGE_CONFIG[categorySlug];
  const intentId = SLUG_TO_INTENT[categorySlug] ?? 'find-investment';
  const cf = listing.customFields;

  const locationParts = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter((part) => !isEmptyDisplayValue(part));
  const location = locationParts.join(', ') || toDisplayValue(listing.location);

  const publisher = buildPublisher(listing.companyId, context);
  const customFacts = buildCustomFacts(categorySlug, cf);

  const equityDisplay = cf.equityOffered != null && cf.equityOffered !== ''
    ? `${toDisplayValue(cf.equityOffered)}%`
    : '';

  const galleryItems = images.length
    ? images
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img, i) => ({
          id: img.id,
          label: img.alt ?? `Görsel ${i + 1}`,
          emoji: '🖼️',
          imageUrl: img.url,
        }))
    : [];

  const attachments = toDisplayValue(cf.cvUrl)
    ? [{
        id: 'cv',
        name: 'Özgeçmiş',
        type: 'pdf' as const,
        meta: 'CV',
      }]
    : [];

  const companyName = context?.company?.name ?? '';
  const companySummary = context?.company?.description ?? listing.shortDescription;

  return {
    id: listing.slug,
    listingId: listing.id,
    ownerUserId: listing.ownerId,
    companyId: listing.companyId,
    category: {
      id: intentId,
      label: meta?.label ?? category?.name ?? 'İlan',
      accent: meta?.accent ?? category?.accentColor ?? '#6366F1',
    },
    title: listing.title,
    shortDescription: listing.shortDescription,
    longDescription: listing.longDescription || listing.shortDescription,
    location,
    publishedAt: formatDate(listing.publishedAt),
    views: listing.viewCount,
    interestedCount: listing.interestedCount,
    verified: listing.isVerified || hasAnyTrustBadge(publisher.trust),
    emoji: CATEGORY_EMOJI[categorySlug] ?? '📋',
    tags: tags.map((t) => t.name),
    investment: {
      requested: toDisplayValue(cf.investmentAmount) || toDisplayValue(cf.ticketSizeMin),
      equity: equityDisplay,
      stage: toDisplayValue(cf.stage) || toDisplayValue(cf.preferredStages),
      industry: toDisplayValue(cf.sectors),
      companyAge: '',
      website: toDisplayValue(context?.company?.website),
    },
    company: {
      name: companyName,
      emoji: '🏢',
      city: toDisplayValue(context?.company?.city ?? listing.city),
      website: toDisplayValue(context?.company?.website),
      employees: toDisplayValue(context?.company?.employeeCount),
      founded: context?.company?.foundedYear ? String(context.company.foundedYear) : '',
      summary: companySummary,
    },
    attachments,
    gallery: galleryItems,
    timeline: [],
    owner: {
      name: publisher.name,
      role: publisher.subtitle ?? (publisher.type === 'company' ? 'Şirket' : 'Kişisel'),
      initials: publisher.initials,
      verified: publisher.verified,
      memberSince: formatDate(listing.createdAt),
    },
    publisher,
    activity: activityHistory.slice(0, 5).map((a) => ({
      id: a.id,
      text: a.summary,
      time: formatDate(a.createdAt),
    })),
    similar: [],
    customFacts,
  };
}

function buildPublisher(
  companyId: string | null,
  context?: { profile?: Profile | null; company?: Company | null },
): ListingPublisher {
  const profileTrust = trustFromProfile(context?.profile);

  if (companyId && context?.company) {
    const company = context.company;
    const trust: TrustBadges = {
      user: profileTrust.user,
      investor: profileTrust.investor,
      company: trustFromCompany(company),
    };
    return {
      type: 'company',
      name: company.name,
      avatarUrl: company.logoUrl,
      initials: company.name.slice(0, 2).toUpperCase(),
      verified: hasAnyTrustBadge(trust),
      trust,
      href: `/company/${company.slug}`,
      subtitle: company.industry ?? 'Şirket',
    };
  }

  const profile = context?.profile;
  const trust: TrustBadges = {
    user: profileTrust.user,
    investor: profileTrust.investor,
    company: false,
  };
  return {
    type: 'user',
    name: profile?.displayName ?? 'Kullanıcı',
    avatarUrl: profile?.avatarUrl ?? null,
    initials: (profile?.displayName ?? 'K').slice(0, 2).toUpperCase(),
    verified: hasAnyTrustBadge(trust),
    trust,
    href: profile?.username ? `/profil/${profile.username}` : '#',
    subtitle: profile?.headline ?? 'Kişisel ilan',
  };
}
