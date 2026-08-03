import type {
  AccountDashboardStats,
  AccountHubStats,
  AccountNavItem,
  AccountQuickAction,
} from '@/features/account/types/account-panel.types';

export const ACCOUNT_PANEL_BASE = '/hesabim';

/**
 * Left sidebar — links only to existing routes (no new route structure).
 * Nested items point at parent pages / query tabs where dedicated routes do not exist.
 */
export const ACCOUNT_NAV_ITEMS: readonly AccountNavItem[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    href: ACCOUNT_PANEL_BASE,
    icon: 'LayoutDashboard',
  },
  {
    id: 'account',
    label: 'Hesabım',
    href: `${ACCOUNT_PANEL_BASE}/profilim`,
    icon: 'User',
    children: [
      {
        id: 'profile',
        label: 'Profilim',
        href: `${ACCOUNT_PANEL_BASE}/profilim`,
        icon: 'User',
      },
      {
        id: 'security',
        label: 'Güvenlik',
        href: `${ACCOUNT_PANEL_BASE}/guvenlik`,
        icon: 'Shield',
      },
      {
        id: 'privacy',
        label: 'Gizlilik',
        href: `${ACCOUNT_PANEL_BASE}/ayarlar#gizlilik`,
        icon: 'Lock',
      },
      {
        id: 'verifications',
        label: 'Doğrulamalarım',
        href: '/ayarlar#dogrulama',
        icon: 'BadgeCheck',
      },
    ],
  },
  {
    id: 'listings',
    label: 'İlanlarım',
    href: `${ACCOUNT_PANEL_BASE}/ilanlarim`,
    icon: 'Megaphone',
    children: [
      {
        id: 'listings-active',
        label: 'Yayındaki ilanlar',
        href: `${ACCOUNT_PANEL_BASE}/ilanlarim?tab=active`,
        icon: 'Megaphone',
      },
      {
        id: 'listings-drafts',
        label: 'Taslaklar',
        href: `${ACCOUNT_PANEL_BASE}/ilanlarim?tab=unpublished`,
        icon: 'FileText',
      },
      {
        id: 'listings-passive',
        label: 'Pasif ilanlar',
        href: `${ACCOUNT_PANEL_BASE}/ilanlarim?tab=expired`,
        icon: 'Archive',
      },
      {
        id: 'listings-packages',
        label: 'Paketlerim',
        href: `${ACCOUNT_PANEL_BASE}/vitrinlerim`,
        icon: 'Package',
      },
    ],
  },
  {
    id: 'favorites',
    label: 'Favorilerim',
    href: `${ACCOUNT_PANEL_BASE}/favorilerim`,
    icon: 'Star',
    children: [
      {
        id: 'favorites-listings',
        label: 'Favori ilanlar',
        href: `${ACCOUNT_PANEL_BASE}/favorilerim`,
        icon: 'Heart',
      },
      {
        id: 'favorites-people',
        label: 'Takip ettiğim kişiler',
        href: `${ACCOUNT_PANEL_BASE}/favorilerim#kisiler`,
        icon: 'Users',
      },
      {
        id: 'favorites-companies',
        label: 'Takip ettiğim şirketler',
        href: `${ACCOUNT_PANEL_BASE}/favorilerim#sirketler`,
        icon: 'Building2',
      },
      {
        id: 'favorites-searches',
        label: 'Kaydedilen aramalar',
        href: `${ACCOUNT_PANEL_BASE}/favorilerim#aramalar`,
        icon: 'Search',
      },
    ],
  },
  {
    id: 'messages',
    label: 'Mesajlarım',
    href: '/dashboard/mesajlarim',
    icon: 'MessageSquare',
  },
  {
    id: 'notifications',
    label: 'Bildirimlerim',
    href: `${ACCOUNT_PANEL_BASE}/bildirimlerim`,
    icon: 'Bell',
  },
  {
    id: 'payments',
    label: 'Ödemelerim',
    href: `${ACCOUNT_PANEL_BASE}/odemelerim`,
    icon: 'CreditCard',
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    href: `${ACCOUNT_PANEL_BASE}/ayarlar`,
    icon: 'Settings',
  },
  {
    id: 'logout',
    label: 'Çıkış Yap',
    href: '/auth/signout',
    icon: 'LogOut',
    isAction: true,
  },
] as const;

export const EMPTY_ACCOUNT_HUB_STATS: AccountHubStats = {
  listings: 0,
  favorites: 0,
  messages: 0,
  followers: 0,
};

/** Mock dashboard stats — legacy AccountStats */
export const MOCK_ACCOUNT_DASHBOARD_STATS: AccountDashboardStats = {
  totalListings: 12,
  activeListings: 7,
  totalViews: 1840,
  totalFavorites: 96,
  remainingShowcaseDuration: '18 gün',
};

export const ACCOUNT_QUICK_ACTIONS: readonly AccountQuickAction[] = [
  {
    id: 'create-listing',
    label: 'Yeni ilan oluştur',
    href: '/ilan/olustur',
    description: 'Yeni bir fırsat yayınlayın',
  },
  {
    id: 'favorites',
    label: 'Favorilerim',
    href: `${ACCOUNT_PANEL_BASE}/favorilerim`,
    description: 'Kaydettiğiniz ilanlar',
  },
  {
    id: 'showcases',
    label: 'Vitrinlerim',
    href: `${ACCOUNT_PANEL_BASE}/vitrinlerim`,
    description: 'Aktif vitrin paketleriniz',
  },
  {
    id: 'notifications',
    label: 'Bildirimlerim',
    href: `${ACCOUNT_PANEL_BASE}/bildirimlerim`,
    description: 'Hesap bildirimleriniz',
  },
] as const;
