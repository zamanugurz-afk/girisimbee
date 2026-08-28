import type { ContentItem } from '@/features/categories/types/category.types';

/** Öne Çıkan İlanlar category tabs only (other home sections stay unfiltered). */
export type HomeCategoryTabId =
  | 'all'
  | 'partner'
  | 'franchise'
  | 'job'
  | 'digital-ai';

export const HOME_CATEGORY_TAB_SLUG: Partial<Record<HomeCategoryTabId, string>> = {
  partner: 'ortak-bul',
  franchise: 'bayilik-al',
  job: 'ise-al',
  'digital-ai': 'dijital-ai',
};

export function isInvestmentSeekingContentItem(item: ContentItem): boolean {
  const type = item.listingTypeLabel?.toLocaleLowerCase('tr-TR') ?? '';
  return (
    item.listingIconKey === 'investment'
    || type.includes('yatırım arıyorum')
    || (item.listingGroupLabel === 'Yatırım' && item.listingIconKey !== 'investor' && !type.includes('yatırım yap'))
  );
}

export function isUserDiscoverableContentItem(item: ContentItem): boolean {
  return !isInvestmentSeekingContentItem(item);
}

export const HOME_CATEGORY_TABS: {
  id: HomeCategoryTabId;
  label: string;
  viewAllHref: string;
  match: (item: ContentItem) => boolean;
}[] = [
  {
    id: 'all',
    label: 'Tümü',
    viewAllHref: '/kesfet?urgent=1',
    match: isUserDiscoverableContentItem,
  },
  {
    id: 'partner',
    label: 'Ortak Arıyorum',
    viewAllHref: '/partners',
    match: (item) =>
      item.listingIconKey === 'partner'
      || item.listingGroupLabel === 'Ortaklık',
  },
  {
    id: 'franchise',
    label: 'Franchise Fırsatları',
    viewAllHref: '/franchise/buy',
    match: (item) => {
      const type = item.listingTypeLabel?.toLocaleLowerCase('tr-TR') ?? '';
      return (
        item.listingIconKey === 'franchise'
        || item.listingGroupLabel === 'Franchise İlanları'
        || type.includes('franchise')
        || type.includes('bayilik')
      );
    },
  },
  {
    id: 'job',
    label: 'İş İlanları',
    viewAllHref: '/is',
    match: (item) =>
      item.listingIconKey === 'employer'
      || item.listingIconKey === 'job-seeker'
      || item.listingGroupLabel === 'İş',
  },
  {
    id: 'digital-ai',
    label: 'Dijital & AI Çözümleri',
    viewAllHref: '/dijital-ai',
    match: (item) => {
      const type = item.listingTypeLabel?.toLocaleLowerCase('tr-TR') ?? '';
      return (
        item.listingIconKey === 'digital'
        || item.listingGroupLabel === 'Dijital & AI Çözümleri'
        || type.includes('dijital')
      );
    },
  },
];

/** Hidden from homepage featured chips — catalog/API match kept. */
export const HOME_FEATURED_HIDDEN_TAB_IDS = ['digital-ai'] as const;

export function isHomeFeaturedTabVisible(id: HomeCategoryTabId): boolean {
  return !HOME_FEATURED_HIDDEN_TAB_IDS.includes(id as (typeof HOME_FEATURED_HIDDEN_TAB_IDS)[number]);
}

export function resolveHomeCategoryTab(id: string): HomeCategoryTabId | null {
  return HOME_CATEGORY_TABS.some((tab) => tab.id === id) ? (id as HomeCategoryTabId) : null;
}
