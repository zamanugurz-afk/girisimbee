import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';
import { startOfTodayIstanbulIso, endOfTodayIstanbulIso } from '@/features/home/lib/date-bounds';

export type HomeListingSectionId =
  | 'urgent'
  | 'today'
  | 'most_viewed';

export interface HomeListingSectionConfig {
  id: HomeListingSectionId;
  title: string;
  description: string;
  badge: string;
  badgeClassName: string;
  /** Topic color for the section heading */
  titleClassName: string;
  /** Softer topic color for the eyebrow label */
  eyebrowClassName: string;
  /** Hex accent used for header rail / soft wash */
  accent: string;
  viewAllHref: string;
  /** Empty-state copy when the section has no listings */
  emptyMessage: string;
  resolveBrowseParams: () => MarketplaceBrowseParams;
}

const SECTION_LIMIT = 8;

export const HOME_LISTING_SECTIONS: HomeListingSectionConfig[] = [
  {
    id: 'urgent',
    title: 'Süper İlanlar',
    description: 'Süper İlan paketi ile hızlandırılmış ve öncelikli fırsatlar.',
    badge: 'Süper İlan',
    badgeClassName: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    titleClassName: 'text-[#E11D48]',
    eyebrowClassName: 'text-[#FB7185]',
    accent: '#E11D48',
    viewAllHref: '/kesfet?urgent=1',
    emptyMessage: 'Henüz süper ilan kategorisine eklenmiş bir ilan bulunmuyor.',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      isUrgent: true,
      activeUrgentOnly: true,
      sortBy: 'newest',
    }),
  },
  {
    id: 'today',
    title: 'Bugünün İlanları',
    description: 'Bugün yayınlanan en yeni fırsatları keşfedin.',
    badge: 'Bugün',
    badgeClassName: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    titleClassName: 'text-[#059669]',
    eyebrowClassName: 'text-[#34D399]',
    accent: '#059669',
    viewAllHref: '/kesfet?today=1',
    emptyMessage: 'Bugün henüz ilan yayınlanmadı.',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      publishedAfter: startOfTodayIstanbulIso(),
      publishedBefore: endOfTodayIstanbulIso(),
      sortBy: 'newest',
    }),
  },
  {
    id: 'most_viewed',
    title: 'En Çok Görüntülenenler',
    description: 'Platformda en fazla ilgi gören ilanlar.',
    badge: 'Popüler',
    badgeClassName: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    titleClassName: 'text-[#D97706]',
    eyebrowClassName: 'text-[#FBBF24]',
    accent: '#D97706',
    viewAllHref: '/kesfet?sort=most_viewed',
    emptyMessage: 'Henüz görüntülenen ilan bulunmuyor.',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      sortBy: 'most_viewed',
    }),
  },
];
