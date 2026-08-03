import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  Megaphone,
  Package,
  PenLine,
  ScrollText,
  Search,
  Settings,
  Shield,
  Store,
  Ticket,
  Users,
} from 'lucide-react';

export const ADMIN_PANEL_BASE = '/admin';

export type AdminNavId =
  | 'overview'
  | 'users'
  | 'listings'
  | 'verifications'
  | 'moderation'
  | 'payments'
  | 'packages'
  | 'market'
  | 'notifications'
  | 'reports'
  | 'coupons'
  | 'content'
  | 'seo'
  | 'settings'
  | 'logs';

export type AdminNavItem = {
  id: AdminNavId;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const ADMIN_ROUTES = {
  overview: ADMIN_PANEL_BASE,
  users: `${ADMIN_PANEL_BASE}/users`,
  listings: `${ADMIN_PANEL_BASE}/listings`,
  verifications: `${ADMIN_PANEL_BASE}/verifications`,
  moderation: `${ADMIN_PANEL_BASE}/moderation`,
  payments: `${ADMIN_PANEL_BASE}/payments`,
  packages: `${ADMIN_PANEL_BASE}/packages`,
  market: `${ADMIN_PANEL_BASE}/market`,
  notifications: `${ADMIN_PANEL_BASE}/notifications`,
  reports: `${ADMIN_PANEL_BASE}/reports`,
  coupons: `${ADMIN_PANEL_BASE}/coupons`,
  content: `${ADMIN_PANEL_BASE}/content`,
  seo: `${ADMIN_PANEL_BASE}/seo`,
  settings: `${ADMIN_PANEL_BASE}/settings`,
  logs: `${ADMIN_PANEL_BASE}/logs`,
} as const;

/** Primary admin sidebar — skeleton architecture for upcoming modules. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    href: ADMIN_ROUTES.overview,
    icon: LayoutDashboard,
    exact: true,
  },
  { id: 'users', label: 'Kullanıcılar', href: ADMIN_ROUTES.users, icon: Users },
  { id: 'listings', label: 'İlanlar', href: ADMIN_ROUTES.listings, icon: Megaphone },
  {
    id: 'verifications',
    label: 'Doğrulamalar',
    href: ADMIN_ROUTES.verifications,
    icon: BadgeCheck,
  },
  {
    id: 'moderation',
    label: 'Moderasyon',
    href: ADMIN_ROUTES.moderation,
    icon: Shield,
  },
  { id: 'payments', label: 'Ödemeler', href: ADMIN_ROUTES.payments, icon: CreditCard },
  { id: 'packages', label: 'Paketler', href: ADMIN_ROUTES.packages, icon: Package },
  { id: 'market', label: 'MARKET', href: ADMIN_ROUTES.market, icon: Store },
  {
    id: 'notifications',
    label: 'Bildirimler',
    href: ADMIN_ROUTES.notifications,
    icon: Bell,
  },
  { id: 'reports', label: 'Raporlar', href: ADMIN_ROUTES.reports, icon: FileText, exact: true },
  { id: 'coupons', label: 'Kuponlar', href: ADMIN_ROUTES.coupons, icon: Ticket },
  {
    id: 'content',
    label: 'İçerik Yönetimi',
    href: ADMIN_ROUTES.content,
    icon: PenLine,
  },
  { id: 'seo', label: 'SEO', href: ADMIN_ROUTES.seo, icon: Search },
  { id: 'settings', label: 'Ayarlar', href: ADMIN_ROUTES.settings, icon: Settings },
  {
    id: 'logs',
    label: 'Sistem Günlükleri',
    href: ADMIN_ROUTES.logs,
    icon: ScrollText,
  },
] as const;

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  [ADMIN_PANEL_BASE]: 'Yönetim Merkezi',
  [ADMIN_ROUTES.users]: 'Kullanıcılar',
  [ADMIN_ROUTES.listings]: 'İlanlar',
  [ADMIN_ROUTES.verifications]: 'Doğrulamalar',
  [ADMIN_ROUTES.moderation]: 'Moderasyon',
  [ADMIN_ROUTES.payments]: 'Ödemeler',
  [ADMIN_ROUTES.packages]: 'Paketler',
  [ADMIN_ROUTES.market]: 'MARKET',
  [ADMIN_ROUTES.notifications]: 'Bildirimler',
  [ADMIN_ROUTES.reports]: 'Raporlar',
  [ADMIN_ROUTES.coupons]: 'Kuponlar',
  [ADMIN_ROUTES.content]: 'İçerik Yönetimi',
  [ADMIN_ROUTES.seo]: 'SEO',
  [ADMIN_ROUTES.settings]: 'Ayarlar',
  [ADMIN_ROUTES.logs]: 'Sistem Günlükleri',
  [`${ADMIN_PANEL_BASE}/dashboard`]: 'Yönetim Merkezi',
  [`${ADMIN_PANEL_BASE}/reports/moderation`]: 'Moderasyon',
  [`${ADMIN_PANEL_BASE}/placements`]: 'Vitrinler',
  [`${ADMIN_PANEL_BASE}/support`]: 'Destek',
  [`${ADMIN_PANEL_BASE}/companies`]: 'Şirketler',
  [`${ADMIN_PANEL_BASE}/search`]: 'Arama',
};
