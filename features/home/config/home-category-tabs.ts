import type { ContentItem } from '@/features/categories/types/category.types';

/** Öne Çıkan İlanlar category tabs only (other home sections stay unfiltered). */
export type HomeCategoryTabId =
  | 'all'
  | 'entrepreneur'
  | 'partner'
  | 'franchise'
  | 'job'
  | 'digital-ai';

export const HOME_CATEGORY_TAB_SLUG: Partial<Record<HomeCategoryTabId, string>> = {
  entrepreneur: 'yatirim-bul',
  partner: 'ortak-bul',
  franchise: 'bayilik-al',
  job: 'ise-al',
  'digital-ai': 'dijital-ai',
};

export const HOME_CATEGORY_TABS: {
  id: HomeCategoryTabId;
  label: string;
  viewAllHref: string;
  match: (item: ContentItem) => boolean;
}[] = [
  {
    id: 'all',
    label: 'Tümü',
    viewAllHref: '/kesfet?featured=1',
    match: () => true,
  },
  {
    id: 'entrepreneur',
    label: 'Yatırım Arıyorum',
    viewAllHref: '/invest',
    match: (item) => {
      const type = item.listingTypeLabel?.toLocaleLowerCase('tr-TR') ?? '';
      return (
        item.listingIconKey === 'investment'
        || type.includes('yatırım arıyorum')
        || (item.listingGroupLabel === 'Yatırım' && item.listingIconKey !== 'investor' && !type.includes('yatırım yap'))
      );
    },
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
    label: 'Franchise İlanlar',
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

export function resolveHomeCategoryTab(id: string): HomeCategoryTabId | null {
  return HOME_CATEGORY_TABS.some((tab) => tab.id === id) ? (id as HomeCategoryTabId) : null;
}
