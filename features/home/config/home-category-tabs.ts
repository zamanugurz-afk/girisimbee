import type { ContentItem } from '@/features/categories/types/category.types';

/** Öne Çıkan İlanlar category tabs only (other home sections stay unfiltered). */
export type HomeCategoryTabId =
  | 'all'
  | 'entrepreneur'
  | 'job'
  | 'partner'
  | 'digital-ai'
  | 'general';

export const HOME_CATEGORY_TAB_SLUG: Partial<Record<HomeCategoryTabId, string>> = {
  entrepreneur: 'yatirim-bul',
  job: 'ise-al',
  partner: 'ortak-bul',
  'digital-ai': 'dijital-ai',
  general: 'genel-ilan',
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
    label: 'Girişimci',
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
    id: 'job',
    label: 'İş Fırsatı',
    viewAllHref: '/is',
    match: (item) =>
      item.listingIconKey === 'employer'
      || item.listingIconKey === 'job-seeker'
      || item.listingGroupLabel === 'İş',
  },
  {
    id: 'partner',
    label: 'Ortaklık',
    viewAllHref: '/partners',
    match: (item) =>
      item.listingIconKey === 'partner'
      || item.listingGroupLabel === 'Ortaklık',
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
  {
    id: 'general',
    label: 'Genel İlanlar',
    /** Browse genel-ilan category only (İlan Ver → Genel İlan). */
    viewAllHref: '/kesfet?category=genel-ilan',
    match: (item) => {
      const type = item.listingTypeLabel?.toLocaleLowerCase('tr-TR') ?? '';
      return (
        item.listingIconKey === 'general'
        || item.listingGroupLabel === 'İlan'
        || type === 'ilan'
        || type === 'genel ilan'
        || type.includes('genel ilan')
      );
    },
  },
];

export function resolveHomeCategoryTab(id: string): HomeCategoryTabId | null {
  return HOME_CATEGORY_TABS.some((tab) => tab.id === id) ? (id as HomeCategoryTabId) : null;
}
