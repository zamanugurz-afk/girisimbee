import type { LucideIcon } from 'lucide-react';
import { Building2, Landmark, Rocket, Star } from 'lucide-react';
import type {
  AccountFavoriteCategory,
  AccountFavoriteContentKind,
  AccountFavoritesTab,
} from '@/features/account/types/account-favorites.types';

export const ACCOUNT_FAVORITES_TABS: {
  id: AccountFavoritesTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'ilanlar', label: 'Genel ilanlar', icon: Star },
  { id: 'girisimler', label: 'Girişim ilanları', icon: Rocket },
  { id: 'sirketler', label: 'İş / franchise', icon: Building2 },
  { id: 'yatirimcilar', label: 'Yatırımcı ilanları', icon: Landmark },
];

export const ACCOUNT_FAVORITE_CATEGORY_LABELS: Record<AccountFavoriteCategory, string> = {
  girisimci: 'Girişim',
  yatirimci: 'Yatırımcı',
  is_arayan: 'İş arayan',
  is_veren: 'İş veren',
  ortaklik: 'Ortaklık',
  franchise: 'Franchise İlanları',
};

export const ACCOUNT_FAVORITE_CONTENT_KIND_LABELS: Record<AccountFavoriteContentKind, string> = {
  ilanlar: 'Genel ilanlar',
  girisimler: 'Girişim ilanları',
  sirketler: 'İş / franchise',
  yatirimcilar: 'Yatırımcı ilanları',
};

/** Map listing category buckets → Favorilerim content tabs. */
export const ACCOUNT_FAVORITE_CATEGORY_TO_CONTENT_KIND: Record<
  AccountFavoriteCategory,
  AccountFavoriteContentKind
> = {
  girisimci: 'girisimler',
  yatirimci: 'yatirimcilar',
  is_veren: 'sirketler',
  franchise: 'sirketler',
  is_arayan: 'ilanlar',
  ortaklik: 'ilanlar',
};
