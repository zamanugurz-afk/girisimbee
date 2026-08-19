/** User dashboard panel routes — presentation only. */

export const DASHBOARD_BASE = '/dashboard';

export const DASHBOARD_ROUTES = {
  overview: DASHBOARD_BASE,
  profil: `${DASHBOARD_BASE}/profil`,
  guvenlik: `${DASHBOARD_BASE}/guvenlik`,
  gizlilik: `${DASHBOARD_BASE}/gizlilik`,
  dogrulamalar: `${DASHBOARD_BASE}/dogrulamalar`,
  ilanlarim: `${DASHBOARD_BASE}/ilanlarim`,
  kariyerProfilim: `${DASHBOARD_BASE}/kariyer-profilim`,
  eslesmeler: `${DASHBOARD_BASE}/eslesmeler`,
  ortaklikEslesmeleri: `${DASHBOARD_BASE}/ortaklik-eslesmeleri`,
  favorilerim: `${DASHBOARD_BASE}/favorilerim`,
  mesajlarim: '/mesajlarim',
  iletisimTalepleri: `${DASHBOARD_BASE}/iletisim-talepleri`,
  takipcilerim: `${DASHBOARD_BASE}/takipcilerim`,
  bildirimlerim: `${DASHBOARD_BASE}/bildirimlerim`,
  odemelerim: `${DASHBOARD_BASE}/odemelerim`,
  paketlerim: `${DASHBOARD_BASE}/paketlerim`,
  ayarlar: `${DASHBOARD_BASE}/ayarlar`,
} as const;

export type DashboardNavId =
  | 'overview'
  | 'account'
  | 'profil'
  | 'guvenlik'
  | 'gizlilik'
  | 'dogrulamalar'
  | 'ilanlarim'
  | 'kariyerProfilim'
  | 'eslesmeler'
  | 'ortaklikEslesmeleri'
  | 'favorilerim'
  | 'mesajlarim'
  | 'iletisimTalepleri'
  | 'takipcilerim'
  | 'bildirimlerim'
  | 'odemelerim'
  | 'paketlerim'
  | 'ayarlar';

export type DashboardNavIcon =
  | 'LayoutDashboard'
  | 'User'
  | 'Shield'
  | 'Lock'
  | 'BadgeCheck'
  | 'Megaphone'
  | 'Briefcase'
  | 'Sparkles'
  | 'Handshake'
  | 'Star'
  | 'MessageSquare'
  | 'Users'
  | 'Bell'
  | 'CreditCard'
  | 'Package'
  | 'Settings';

export interface DashboardNavItem {
  id: DashboardNavId;
  label: string;
  href: string;
  icon: DashboardNavIcon;
  children?: readonly DashboardNavItem[];
}

/**
 * User panel sidebar only — never includes /admin links.
 * Admin lives exclusively under /admin.
 */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    href: DASHBOARD_ROUTES.overview,
    icon: 'LayoutDashboard',
  },
  {
    id: 'account',
    label: 'Hesabım',
    href: DASHBOARD_ROUTES.profil,
    icon: 'User',
    children: [
      { id: 'profil', label: 'Profil', href: DASHBOARD_ROUTES.profil, icon: 'User' },
      { id: 'guvenlik', label: 'Güvenlik', href: DASHBOARD_ROUTES.guvenlik, icon: 'Shield' },
      // Gizlilik deferred — hide from nav for now
      {
        id: 'dogrulamalar',
        label: 'Doğrulamalar',
        href: DASHBOARD_ROUTES.dogrulamalar,
        icon: 'BadgeCheck',
      },
    ],
  },
  {
    id: 'ilanlarim',
    label: 'İlanlarım',
    href: DASHBOARD_ROUTES.ilanlarim,
    icon: 'Megaphone',
  },
  {
    id: 'favorilerim',
    label: 'Favorilerim',
    href: DASHBOARD_ROUTES.favorilerim,
    icon: 'Star',
  },
  {
    id: 'iletisimTalepleri',
    label: 'İletişim Talepleri',
    href: DASHBOARD_ROUTES.iletisimTalepleri,
    icon: 'MessageSquare',
  },
  {
    id: 'mesajlarim',
    label: 'Mesajlarım',
    href: DASHBOARD_ROUTES.mesajlarim,
    icon: 'MessageSquare',
  },
  {
    id: 'takipcilerim',
    label: 'Takipçilerim',
    href: DASHBOARD_ROUTES.takipcilerim,
    icon: 'Users',
  },
  {
    id: 'bildirimlerim',
    label: 'Bildirimlerim',
    href: DASHBOARD_ROUTES.bildirimlerim,
    icon: 'Bell',
  },
  {
    id: 'odemelerim',
    label: 'Ödemelerim',
    href: DASHBOARD_ROUTES.odemelerim,
    icon: 'CreditCard',
  },
  {
    id: 'paketlerim',
    label: 'Paketlerim',
    href: DASHBOARD_ROUTES.paketlerim,
    icon: 'Package',
  },
  {
    id: 'ayarlar',
    label: 'Ayarlar',
    href: DASHBOARD_ROUTES.ayarlar,
    icon: 'Settings',
  },
] as const;
