import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';
import { startOfTodayIstanbulIso, endOfTodayIstanbulIso } from '@/features/home/lib/date-bounds';

export type HomeListingSectionId =
  | 'featured'
  | 'today'
  | 'most_viewed'
  | 'urgent';

export interface HomeListingSectionConfig {
  id: HomeListingSectionId;
  title: string;
  description: string;
  badge: string;
  badgeClassName: string;
  viewAllHref: string;
  resolveBrowseParams: () => MarketplaceBrowseParams;
}

const SECTION_LIMIT = 12;

export const HOME_LISTING_SECTIONS: HomeListingSectionConfig[] = [
  {
    id: 'featured',
    title: 'Öne Çıkan İlanlar',
    description: 'Editoryal olarak öne çıkarılan fırsatlar ve güvenilir ilanlar.',
    badge: 'Öne Çıkan',
    badgeClassName: 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20',
    viewAllHref: '/kesfet?featured=1',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      isFeatured: true,
      activeFeaturedOnly: true,
      sortBy: 'newest',
    }),
  },
  {
    id: 'today',
    title: 'Bugünün İlanları',
    description: 'Bugün yayınlanan en yeni fırsatları keşfedin.',
    badge: 'Bugün',
    badgeClassName: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    viewAllHref: '/kesfet?today=1',
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
    viewAllHref: '/kesfet?sort=most_viewed',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      sortBy: 'most_viewed',
    }),
  },
  {
    id: 'urgent',
    title: 'Acil İlanlar',
    description: 'Hızlı karar gerektiren acil fırsatlar ve ilanlar.',
    badge: 'Acil',
    badgeClassName: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    viewAllHref: '/kesfet?urgent=1',
    resolveBrowseParams: () => ({
      page: 1,
      limit: SECTION_LIMIT,
      isUrgent: true,
      activeUrgentOnly: true,
      sortBy: 'newest',
    }),
  },
];
