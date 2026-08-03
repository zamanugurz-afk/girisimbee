import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Heart,
  Megaphone,
  MessageSquare,
  Settings,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  AccountNotificationIconKey,
  AccountNotificationType,
  AccountNotificationsTab,
} from '@/features/account/types/account-notifications.types';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';

export const ACCOUNT_NOTIFICATIONS_TABS: {
  id: AccountNotificationsTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'all', label: 'Tümü', icon: Bell },
  { id: 'favorites', label: 'Favoriler', icon: Star },
  { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
  { id: 'follows', label: 'Takipler', icon: Users },
  { id: 'listings', label: 'İlanlar', icon: Megaphone },
  { id: 'payments', label: 'Ödemeler', icon: CreditCard },
  { id: 'verifications', label: 'Doğrulamalar', icon: BadgeCheck },
  { id: 'system', label: 'Sistem', icon: Settings },
];

export const ACCOUNT_NOTIFICATION_TYPE_LABELS: Record<AccountNotificationType, string> = {
  favorites: 'Favoriler',
  messages: 'Mesajlar',
  follows: 'Takipler',
  listings: 'İlanlar',
  payments: 'Ödemeler',
  verifications: 'Doğrulamalar',
  system: 'Sistem',
};

export const ACCOUNT_NOTIFICATION_STATUS_LABELS = {
  unread: 'Okunmadı',
  read: 'Okundu',
} as const;

export const ACCOUNT_NOTIFICATION_ICON_MAP: Record<AccountNotificationIconKey, LucideIcon> = {
  bell: Bell,
  star: Star,
  message: MessageSquare,
  users: Users,
  megaphone: Megaphone,
  'credit-card': CreditCard,
  'badge-check': BadgeCheck,
  settings: Settings,
  eye: Eye,
  heart: Heart,
  clock: Clock3,
  check: CheckCircle2,
  x: XCircle,
  alert: AlertCircle,
};

export const ACCOUNT_NOTIFICATION_DEFAULT_HREF: Record<AccountNotificationType, string> = {
  favorites: DASHBOARD_ROUTES.favorilerim,
  messages: DASHBOARD_ROUTES.mesajlarim,
  follows: DASHBOARD_ROUTES.profil,
  listings: DASHBOARD_ROUTES.ilanlarim,
  payments: DASHBOARD_ROUTES.odemelerim,
  verifications: DASHBOARD_ROUTES.dogrulamalar,
  system: DASHBOARD_ROUTES.ayarlar,
};

/** Supported event catalog for UI classification (presentation only). */
export const ACCOUNT_NOTIFICATION_EVENT_CATALOG = [
  {
    key: 'listing_published',
    type: 'listings' as const,
    iconKey: 'megaphone' as const,
    title: 'İlanınız yayınlandı.',
    href: DASHBOARD_ROUTES.ilanlarim,
  },
  {
    key: 'listing_approved',
    type: 'listings' as const,
    iconKey: 'check' as const,
    title: 'İlanınız onaylandı.',
    href: DASHBOARD_ROUTES.ilanlarim,
  },
  {
    key: 'listing_rejected',
    type: 'listings' as const,
    iconKey: 'x' as const,
    title: 'İlanınız reddedildi.',
    href: DASHBOARD_ROUTES.ilanlarim,
  },
  {
    key: 'listing_expired',
    type: 'listings' as const,
    iconKey: 'clock' as const,
    title: 'İlanınızın süresi doldu.',
    href: DASHBOARD_ROUTES.ilanlarim,
  },
  {
    key: 'listing_favorited',
    type: 'favorites' as const,
    iconKey: 'heart' as const,
    title: 'Bir kullanıcı ilanınızı favorilerine ekledi.',
    href: DASHBOARD_ROUTES.favorilerim,
  },
  {
    key: 'profile_viewed',
    type: 'follows' as const,
    iconKey: 'eye' as const,
    title: 'Bir kullanıcı profilinizi görüntüledi.',
    href: DASHBOARD_ROUTES.profil,
  },
  {
    key: 'user_followed',
    type: 'follows' as const,
    iconKey: 'users' as const,
    title: 'Bir kullanıcı sizi takip etti.',
    href: DASHBOARD_ROUTES.profil,
  },
  {
    key: 'new_message',
    type: 'messages' as const,
    iconKey: 'message' as const,
    title: 'Bir kullanıcı size mesaj gönderdi.',
    href: DASHBOARD_ROUTES.mesajlarim,
  },
  {
    key: 'payment_approved',
    type: 'payments' as const,
    iconKey: 'check' as const,
    title: 'Ödemeniz onaylandı.',
    href: DASHBOARD_ROUTES.odemelerim,
  },
  {
    key: 'payment_rejected',
    type: 'payments' as const,
    iconKey: 'x' as const,
    title: 'Ödemeniz reddedildi.',
    href: DASHBOARD_ROUTES.odemelerim,
  },
  {
    key: 'verification_approved',
    type: 'verifications' as const,
    iconKey: 'badge-check' as const,
    title: 'Doğrulama başvurunuz onaylandı.',
    href: DASHBOARD_ROUTES.dogrulamalar,
  },
  {
    key: 'verification_rejected',
    type: 'verifications' as const,
    iconKey: 'x' as const,
    title: 'Doğrulama başvurunuz reddedildi.',
    href: DASHBOARD_ROUTES.dogrulamalar,
  },
  {
    key: 'profile_incomplete',
    type: 'system' as const,
    iconKey: 'alert' as const,
    title: 'Profil bilgileriniz eksik.',
    href: DASHBOARD_ROUTES.profil,
  },
  {
    key: 'package_expiring',
    type: 'payments' as const,
    iconKey: 'clock' as const,
    title: 'Paketinizin süresi doluyor.',
    href: DASHBOARD_ROUTES.paketlerim,
  },
] as const;
