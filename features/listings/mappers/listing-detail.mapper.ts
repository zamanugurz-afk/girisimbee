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

const SLUG_TO_INTENT = Object.fromEntries(
  Object.entries(INTENT_TO_CATEGORY_SLUG).map(([intent, slug]) => [slug, intent]),
) as Record<string, CategoryIntentId>;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

  const location = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter(Boolean)
    .join(', ');

  const publisher = buildPublisher(listing.companyId, context);

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
    location: location || listing.location || '—',
    publishedAt: formatDate(listing.publishedAt),
    views: listing.viewCount,
    interestedCount: listing.interestedCount,
    verified: listing.isVerified || hasAnyTrustBadge(publisher.trust),
    emoji: CATEGORY_EMOJI[categorySlug] ?? '📋',
    tags: tags.map((t) => t.name),
    investment: {
      requested: cf.investmentAmount
        ? `${Number(cf.investmentAmount).toLocaleString('tr-TR')} ${cf.currency ?? 'TRY'}`
        : '—',
      equity: (cf.equityOffered as string) ?? '—',
      stage: (cf.stage as string) ?? '—',
      industry: '—',
      companyAge: '—',
      website: '—',
    },
    company: context?.company
      ? {
          name: context.company.name,
          emoji: '🏢',
          city: context.company.city ?? listing.city ?? '—',
          website: context.company.website ?? '—',
          employees: context.company.employeeCount ?? '—',
          founded: context.company.foundedYear ? String(context.company.foundedYear) : '—',
          summary: context.company.description ?? listing.shortDescription,
        }
      : {
          name: '—',
          emoji: CATEGORY_EMOJI[categorySlug] ?? '🏢',
          city: listing.city ?? '—',
          website: '—',
          employees: '—',
          founded: '—',
          summary: listing.shortDescription,
        },
    attachments: [],
    gallery: images.length
      ? images
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((img, i) => ({
            id: img.id,
            label: img.alt ?? `Görsel ${i + 1}`,
            emoji: '🖼️',
            imageUrl: img.url,
          }))
      : [{ id: 'default', label: listing.title, emoji: CATEGORY_EMOJI[categorySlug] ?? '📋' }],
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
