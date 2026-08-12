import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  Handshake,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Scale,
  Settings,
  Shield,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';

export const ADMIN_PANEL_BASE = '/admin';

export type AdminNavId =
  | 'overview'
  | 'users'
  | 'listings'
  | 'verifications'
  | 'moderation'
  | 'contact_requests'
  | 'payments'
  | 'packages'
  | 'market'
  | 'ad_inquiries'
  | 'support_inquiries'
  | 'notifications'
  | 'reports'
  | 'placements'
  | 'content'
  | 'seo'
  | 'consent_procedures'
  | 'kvkk_consents'
  | 'settings'
  | 'logs'

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
  contactRequests: `${ADMIN_PANEL_BASE}/iletisim-talepleri`,
  payments: `${ADMIN_PANEL_BASE}/payments`,
  packages: `${ADMIN_PANEL_BASE}/packages`,
  market: `${ADMIN_PANEL_BASE}/market`,
  adInquiries: `${ADMIN_PANEL_BASE}/reklam`,
  supportInquiries: `${ADMIN_PANEL_BASE}/destek`,
  notifications: `${ADMIN_PANEL_BASE}/notifications`,
  reports: `${ADMIN_PANEL_BASE}/reports`,
  placements: `${ADMIN_PANEL_BASE}/placements`,
  /** @deprecated Coupons live under packages — kept for redirects. */
  coupons: `${ADMIN_PANEL_BASE}/packages`,
  content: `${ADMIN_PANEL_BASE}/content`,
  seo: `${ADMIN_PANEL_BASE}/seo`,
  consentProcedures: `${ADMIN_PANEL_BASE}/izin-saklama`,
  kvkkConsents: `${ADMIN_PANEL_BASE}/kvkk-izinleri`,
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
    id: 'placements',
    label: 'Vitrinler',
    href: ADMIN_ROUTES.placements,
    icon: Sparkles,
  },
  {
    id: 'verifications',
    label: 'Doğrulamalar',
    href: ADMIN_ROUTES.verifications,
    icon: BadgeCheck,
  },
  {
    id: 'moderation',
    label: 'Moderasyon / Şikayetler',
    href: ADMIN_ROUTES.moderation,
    icon: Shield,
  },
  {
    id: 'contact_requests',
    label: 'İletişim Talepleri',
    href: ADMIN_ROUTES.contactRequests,
    icon: Inbox,
  },
  { id: 'payments', label: 'Ödemeler', href: ADMIN_ROUTES.payments, icon: CreditCard },
  { id: 'packages', label: 'Paketler & Kuponlar', href: ADMIN_ROUTES.packages, icon: Package },
  { id: 'market', label: 'MARKET', href: ADMIN_ROUTES.market, icon: Store },
  {
    id: 'ad_inquiries',
    label: 'Reklam & İşbirliği',
    href: ADMIN_ROUTES.adInquiries,
    icon: Handshake,
  },
  {
    id: 'support_inquiries',
    label: 'Destek Talepleri',
    href: ADMIN_ROUTES.supportInquiries,
    icon: LifeBuoy,
  },
  {
    id: 'notifications',
    label: 'Bildirimler',
    href: ADMIN_ROUTES.notifications,
    icon: Bell,
  },
  { id: 'reports', label: 'Raporlar', href: ADMIN_ROUTES.reports, icon: FileText, exact: true },
  {
    id: 'consent_procedures',
    label: 'İzin Saklama',
    href: ADMIN_ROUTES.consentProcedures,
    icon: Scale,
  },
  {
    id: 'kvkk_consents',
    label: 'KVKK İzinleri',
    href: ADMIN_ROUTES.kvkkConsents,
    icon: FileText,
  },
  { id: 'settings', label: 'Ayarlar', href: ADMIN_ROUTES.settings, icon: Settings },
] as const;

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  [ADMIN_PANEL_BASE]: 'Yönetim Merkezi',
  [ADMIN_ROUTES.users]: 'Kullanıcılar',
  [ADMIN_ROUTES.listings]: 'İlanlar',
  [ADMIN_ROUTES.verifications]: 'Doğrulamalar',
  [ADMIN_ROUTES.moderation]: 'Moderasyon / Şikayetler',
  [ADMIN_ROUTES.contactRequests]: 'İletişim Talepleri',
  [`${ADMIN_PANEL_BASE}/moderation/words`]: 'Küfür Listesi',
  [`${ADMIN_PANEL_BASE}/moderation/content`]: 'Şüpheli İçerik',
  [ADMIN_ROUTES.payments]: 'Ödemeler',
  [ADMIN_ROUTES.packages]: 'Paketler & Kuponlar',
  [ADMIN_ROUTES.market]: 'MARKET',
  [ADMIN_ROUTES.adInquiries]: 'Reklam & İşbirliği',
  [ADMIN_ROUTES.supportInquiries]: 'Destek Talepleri',
  [ADMIN_ROUTES.notifications]: 'Bildirimler',
  [ADMIN_ROUTES.reports]: 'Raporlar',
  [ADMIN_ROUTES.placements]: 'Vitrinler',
  [ADMIN_ROUTES.content]: 'İçerik Yönetimi',
  [ADMIN_ROUTES.seo]: 'SEO',
  [ADMIN_ROUTES.consentProcedures]: 'İzin Saklama & Temin',
  [ADMIN_ROUTES.kvkkConsents]: 'KVKK İzin Kayıtları',
  [ADMIN_ROUTES.settings]: 'Ayarlar',
  [ADMIN_ROUTES.logs]: 'Sistem Günlükleri',
  [`${ADMIN_PANEL_BASE}/dashboard`]: 'Yönetim Merkezi',
  [`${ADMIN_PANEL_BASE}/reports/moderation`]: 'Moderasyon',
  [`${ADMIN_PANEL_BASE}/coupons`]: 'Kuponlar',
  [`${ADMIN_PANEL_BASE}/placements`]: 'Vitrinler',
  [`${ADMIN_PANEL_BASE}/support`]: 'Destek',
  [`${ADMIN_PANEL_BASE}/companies`]: 'Şirketler',
  [`${ADMIN_PANEL_BASE}/search`]: 'Arama',
};
