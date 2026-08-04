/** User dashboard panel routes — presentation only. */

export const DASHBOARD_BASE = '/dashboard';

export const DASHBOARD_ROUTES = {
  overview: DASHBOARD_BASE,
  profil: `${DASHBOARD_BASE}/profil`,
  guvenlik: `${DASHBOARD_BASE}/guvenlik`,
  gizlilik: `${DASHBOARD_BASE}/gizlilik`,
  dogrulamalar: `${DASHBOARD_BASE}/dogrulamalar`,
  ilanlarim: `${DASHBOARD_BASE}/ilanlarim`,
  favorilerim: `${DASHBOARD_BASE}/favorilerim`,
  mesajlarim: `${DASHBOARD_BASE}/mesajlarim`,
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
  | 'favorilerim'
  | 'mesajlarim'
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
  | 'Star'
  | 'MessageSquare'
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
      { id: 'gizlilik', label: 'Gizlilik', href: DASHBOARD_ROUTES.gizlilik, icon: 'Lock' },
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
  // V1: messaging deferred — phone-only contact on listings
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
