import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ModuleKey } from '@/lib/domain/modules';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  MARKETPLACE_LISTING_TYPE_IDS,
} from '@/features/listings/config/marketplace-category-map';
import { toDisplayValue } from '@/features/listings/utils/display-value';

export type ListingCardGroup = 'yatirim' | 'is' | 'ortaklik' | 'franchise' | 'genel' | 'dijital';

/** Lucide semantic key — rendered in UI via listing-type-icon. */
export type ListingTypeIconKey =
  | 'investment'
  | 'investor'
  | 'job-seeker'
  | 'employer'
  | 'partner'
  | 'franchise'
  | 'digital'
  | 'general';

/** Group accent colors — sourced from existing Girisimbee palette. */
export const LISTING_CARD_GROUP_COLORS: Record<ListingCardGroup, string> = {
  yatirim: '#3B82F6',
  is: '#22C55E',
  ortaklik: '#F59E0B',
  franchise: '#EC4899',
  genel: '#0EA5E9',
  dijital: '#8B5CF6',
};

export const LISTING_CARD_GROUP_LABELS: Record<ListingCardGroup, string> = {
  yatirim: 'Yatırım',
  is: 'İş',
  ortaklik: 'Ortaklık',
  franchise: 'Franchise İlanları',
  genel: 'İlan',
  dijital: 'Dijital & AI Çözümleri',
};

interface ListingTypeDisplay {
  emoji: string;
  label: string;
  group: ListingCardGroup;
  iconKey: ListingTypeIconKey;
}

type ListingWithDisplayMeta = Listing & {
  listingTypeSlug?: string | null;
  categorySlug?: string | null;
};

const LISTING_TYPE_SLUG_DISPLAY: Record<string, ListingTypeDisplay> = {
  'yatirim-ariyorum': {
    emoji: '💰',
    label: 'YATIRIM ARIYORUM',
    group: 'yatirim',
    iconKey: 'investment',
  },
  'yatirim-yapiyorum': {
    emoji: '💼',
    label: 'YATIRIM YAPIYORUM',
    group: 'yatirim',
    iconKey: 'investor',
  },
  'is-ariyorum': {
    emoji: '🔎',
    label: 'İŞ ARIYORUM',
    group: 'is',
    iconKey: 'job-seeker',
  },
  'ise-aliyorum': {
    emoji: '💼',
    label: 'İŞ İLANI',
    group: 'is',
    iconKey: 'employer',
  },
  'ortak-ariyorum': {
    emoji: '🤝',
    label: 'ORTAK ARIYORUM',
    group: 'ortaklik',
    iconKey: 'partner',
  },
  'franchise-ilan-ver': {
    emoji: '🏪',
    label: 'FRANCHISE',
    group: 'franchise',
    iconKey: 'franchise',
  },
  'bayilik-al': {
    emoji: '🏪',
    label: 'FRANCHISE',
    group: 'franchise',
    iconKey: 'franchise',
  },
  'bayilik-ver': {
    emoji: '🏪',
    label: 'FRANCHISE',
    group: 'franchise',
    iconKey: 'franchise',
  },
  'genel-ilan': {
    emoji: '📢',
    label: 'İLAN',
    group: 'genel',
    iconKey: 'general',
  },
  'dijital-ai-cozum': {
    emoji: '🧠',
    label: 'DİJİTAL & AI',
    group: 'dijital',
    iconKey: 'digital',
  },
};

/** Intent category IDs (c-prefix) → display. Parent marketplace categories are ambiguous. */
const CATEGORY_ID_DISPLAY: Record<string, ListingTypeDisplay> = {
  [CATEGORY_IDS.yatirimBul]: LISTING_TYPE_SLUG_DISPLAY['yatirim-ariyorum'],
  [CATEGORY_IDS.yatirimYap]: LISTING_TYPE_SLUG_DISPLAY['yatirim-yapiyorum'],
  [CATEGORY_IDS.isBul]: LISTING_TYPE_SLUG_DISPLAY['is-ariyorum'],
  [CATEGORY_IDS.iseAl]: LISTING_TYPE_SLUG_DISPLAY['ise-aliyorum'],
  [CATEGORY_IDS.ortakBul]: LISTING_TYPE_SLUG_DISPLAY['ortak-ariyorum'],
  [CATEGORY_IDS.bayilikAl]: LISTING_TYPE_SLUG_DISPLAY['franchise-ilan-ver'],
  [CATEGORY_IDS.genelIlan]: LISTING_TYPE_SLUG_DISPLAY['genel-ilan'],
  [CATEGORY_IDS.dijitalAi]: LISTING_TYPE_SLUG_DISPLAY['dijital-ai-cozum'],
};

/** App + live DB listing type IDs → display (unambiguous). */
const LISTING_TYPE_ID_DISPLAY: Record<string, ListingTypeDisplay> = {
  [LISTING_TYPE_IDS.yatirimBulDefault]: LISTING_TYPE_SLUG_DISPLAY['yatirim-ariyorum'],
  [LISTING_TYPE_IDS.yatirimYapDefault]: LISTING_TYPE_SLUG_DISPLAY['yatirim-yapiyorum'],
  [LISTING_TYPE_IDS.isBulDefault]: LISTING_TYPE_SLUG_DISPLAY['is-ariyorum'],
  [LISTING_TYPE_IDS.iseAlDefault]: LISTING_TYPE_SLUG_DISPLAY['ise-aliyorum'],
  [LISTING_TYPE_IDS.ortakBulDefault]: LISTING_TYPE_SLUG_DISPLAY['ortak-ariyorum'],
  [LISTING_TYPE_IDS.franchiseGiveDefault]: LISTING_TYPE_SLUG_DISPLAY['bayilik-ver'],
  [LISTING_TYPE_IDS.genelIlanDefault]: LISTING_TYPE_SLUG_DISPLAY['genel-ilan'],
  [LISTING_TYPE_IDS.dijitalAiDefault]: LISTING_TYPE_SLUG_DISPLAY['dijital-ai-cozum'],
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum]: LISTING_TYPE_SLUG_DISPLAY['yatirim-ariyorum'],
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum]: LISTING_TYPE_SLUG_DISPLAY['yatirim-yapiyorum'],
  [MARKETPLACE_LISTING_TYPE_IDS.isAriyorum]: LISTING_TYPE_SLUG_DISPLAY['is-ariyorum'],
  [MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum]: LISTING_TYPE_SLUG_DISPLAY['ise-aliyorum'],
  [MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum]: LISTING_TYPE_SLUG_DISPLAY['ortak-ariyorum'],
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikAl]: LISTING_TYPE_SLUG_DISPLAY['bayilik-al'],
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikVer]: LISTING_TYPE_SLUG_DISPLAY['bayilik-ver'],
};

const CATEGORY_SLUG_DISPLAY: Record<string, ListingTypeDisplay> = {
  'yatirim-bul': LISTING_TYPE_SLUG_DISPLAY['yatirim-ariyorum'],
  'yatirim-yap': LISTING_TYPE_SLUG_DISPLAY['yatirim-yapiyorum'],
  'is-bul': LISTING_TYPE_SLUG_DISPLAY['is-ariyorum'],
  'ise-al': LISTING_TYPE_SLUG_DISPLAY['ise-aliyorum'],
  'ortak-bul': LISTING_TYPE_SLUG_DISPLAY['ortak-ariyorum'],
  franchise: LISTING_TYPE_SLUG_DISPLAY['franchise-ilan-ver'],
  'bayilik-al': LISTING_TYPE_SLUG_DISPLAY['bayilik-al'],
  'bayilik-ver': LISTING_TYPE_SLUG_DISPLAY['bayilik-ver'],
  ilan: LISTING_TYPE_SLUG_DISPLAY['genel-ilan'],
  'dijital-ai': LISTING_TYPE_SLUG_DISPLAY['dijital-ai-cozum'],
};

const MODULE_KEY_DISPLAY: Record<ModuleKey, ListingTypeDisplay> = {
  entrepreneurs: LISTING_TYPE_SLUG_DISPLAY['yatirim-ariyorum'],
  investors: LISTING_TYPE_SLUG_DISPLAY['yatirim-yapiyorum'],
  candidates: LISTING_TYPE_SLUG_DISPLAY['is-ariyorum'],
  employers: LISTING_TYPE_SLUG_DISPLAY['ise-aliyorum'],
  founders: LISTING_TYPE_SLUG_DISPLAY['ortak-ariyorum'],
  franchise: LISTING_TYPE_SLUG_DISPLAY['franchise-ilan-ver'],
};

export interface ListingCardDisplayMeta {
  typeEmoji: string;
  typeLabel: string;
  group: ListingCardGroup;
  groupLabel: string;
  groupColor: string;
  iconKey: ListingTypeIconKey;
  price?: string;
}

function resolveListingTypeDisplay(listing: ListingWithDisplayMeta): ListingTypeDisplay {
  // 1) DB join slug (browse/home) — most reliable for live e-prefix rows
  if (listing.listingTypeSlug && LISTING_TYPE_SLUG_DISPLAY[listing.listingTypeSlug]) {
    return LISTING_TYPE_SLUG_DISPLAY[listing.listingTypeSlug];
  }

  // 2) Listing type ID (app lt-prefix or marketplace e-prefix)
  if (LISTING_TYPE_ID_DISPLAY[listing.listingTypeId]) {
    return LISTING_TYPE_ID_DISPLAY[listing.listingTypeId];
  }

  const listingType = categoryRegistry.getListingType(listing.listingTypeId);
  if (listingType?.slug && LISTING_TYPE_SLUG_DISPLAY[listingType.slug]) {
    return LISTING_TYPE_SLUG_DISPLAY[listingType.slug];
  }

  // 3) Module key (set on publish for ecosystem listings)
  if (listing.moduleKey && MODULE_KEY_DISPLAY[listing.moduleKey]) {
    return MODULE_KEY_DISPLAY[listing.moduleKey];
  }

  // 4) Intent category slug / app category id (not parent marketplace category)
  if (listing.categorySlug && CATEGORY_SLUG_DISPLAY[listing.categorySlug]) {
    return CATEGORY_SLUG_DISPLAY[listing.categorySlug];
  }

  const category = categoryRegistry.getCategory(listing.categoryId);
  if (category?.slug && CATEGORY_SLUG_DISPLAY[category.slug]) {
    return CATEGORY_SLUG_DISPLAY[category.slug];
  }

  if (CATEGORY_ID_DISPLAY[listing.categoryId]) {
    return CATEGORY_ID_DISPLAY[listing.categoryId];
  }

  // Neutral fallback — never assume investment
  return { emoji: '📋', label: 'İLAN', group: 'genel', iconKey: 'general' };
}

function formatListingPrice(listing: Listing, group: ListingCardGroup): string | undefined {
  const cf = listing.customFields;

  if (group === 'yatirim') {
    const amount = toDisplayValue(cf.investmentAmount) || toDisplayValue(cf.ticketSizeMin);
    if (amount) return amount;
    if (listing.investmentDetails?.amountSought) {
      return `${listing.investmentDetails.amountSought.toLocaleString('tr-TR')} ${listing.investmentDetails.currency}`;
    }
  }

  if (group === 'is') {
    const salary = toDisplayValue(cf.salaryRange) || toDisplayValue(cf.salaryExpectation);
    if (salary) return salary;
    if (listing.jobDetails?.salaryMin != null || listing.jobDetails?.salaryMax != null) {
      const min = listing.jobDetails.salaryMin?.toLocaleString('tr-TR');
      const max = listing.jobDetails.salaryMax?.toLocaleString('tr-TR');
      const currency = listing.jobDetails.currency ?? 'TRY';
      if (min && max) return `${min} – ${max} ${currency}`;
      if (min) return `${min} ${currency}`;
      if (max) return `${max} ${currency}`;
    }
  }

  if (group === 'franchise') {
    const fee =
      toDisplayValue(cf.franchiseFee)
      || toDisplayValue(cf.franchiseBedeli)
      || toDisplayValue(cf.totalInvestment)
      || toDisplayValue(cf.minimumSermaye);
    if (fee) return fee;
  }

  if (group === 'ortaklik') {
    const partnership = toDisplayValue(cf.partnershipType) || toDisplayValue(listing.partnerDetails?.partnerType);
    if (partnership) return partnership;
  }

  if (group === 'dijital' || group === 'genel') {
    const price = toDisplayValue(cf.priceRange);
    if (price) return price;
  }

  return undefined;
}

export function resolveListingCardDisplay(listing: Listing): ListingCardDisplayMeta {
  const typeDisplay = resolveListingTypeDisplay(listing as ListingWithDisplayMeta);
  const group = typeDisplay.group;

  return {
    typeEmoji: typeDisplay.emoji,
    typeLabel: typeDisplay.label,
    group,
    groupLabel: LISTING_CARD_GROUP_LABELS[group],
    groupColor: LISTING_CARD_GROUP_COLORS[group],
    iconKey: typeDisplay.iconKey,
    price: formatListingPrice(listing, group),
  };
}
