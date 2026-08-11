import type { AdminSystemStatus } from '@/features/admin/panel/types/admin-system-status.types';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';
import type {
  AdminActivityItem,
  AdminCategoryStatItem,
  AdminOverviewChartSeries,
  AdminOverviewSnapshot,
  AdminQuickActionItem,
  AdminRevenueCategoryItem,
} from '@/features/admin/panel/types/admin-overview.types';
import type { AdminTopListingRow } from '@/features/admin/panel/types/admin-panel.types';
import { getMockAdminReportSnapshot } from '@/features/admin/panel/mock/admin-panel.mock';
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Flag,
  Megaphone,
  Ticket,
  Users,
} from 'lucide-react';

function formatCount(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

const weekly = getMockAdminReportSnapshot('weekly');

export const MOCK_ADMIN_OVERVIEW_CARDS: AdminOverviewSnapshot['cards'] = [
  {
    id: 'total_users',
    label: 'Toplam kullanıcı sayısı',
    value: formatCount(weekly.metrics.total_users),
    hint: 'Son 7 günde +42',
    accent: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'total_listings',
    label: 'Toplam ilan sayısı',
    value: formatCount(weekly.metrics.total_listings),
    hint: 'Bu ay +86',
    accent: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'pending_verifications',
    label: 'Bekleyen doğrulamalar',
    value: formatCount(23),
    hint: 'İnceleme kuyruğu',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'daily_revenue',
    label: 'Günlük gelir',
    value: formatCurrency(weekly.metrics.daily_revenue),
    hint: 'Düne göre +12%',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'active_listings',
    label: 'Aktif ilanlar',
    value: formatCount(312),
    hint: 'Yayında',
    accent: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'pending_complaints',
    label: 'Bekleyen şikâyetler',
    value: formatCount(12),
    hint: 'Yüksek öncelik: 3',
    accent: 'text-rose-600 dark:text-rose-400',
  },
];

export const MOCK_ADMIN_OVERVIEW_CHARTS: AdminOverviewChartSeries[] = [
  {
    id: 'users',
    title: 'Kullanıcı büyüme grafiği',
    description: 'Haftalık yeni kullanıcı trendi',
    dataKey: 'views',
    color: 'hsl(var(--primary))',
    data: weekly.chart.map((point, index) => ({
      ...point,
      views: 18 + index * 4 + (index % 2) * 3,
    })),
  },
  {
    id: 'revenue',
    title: 'Gelir grafiği',
    description: 'Haftalık gelir (TRY)',
    dataKey: 'revenue',
    color: 'hsl(142 70% 35%)',
    data: weekly.chart,
  },
  {
    id: 'listings',
    title: 'İlan grafiği',
    description: 'Haftalık yeni ilan sayısı',
    dataKey: 'listings',
    color: 'hsl(262 70% 55%)',
    data: weekly.chart,
  },
];

export const MOCK_ADMIN_ACTIVITIES: AdminActivityItem[] = [
  {
    id: 'act_user_1',
    kind: 'user',
    title: 'Yeni kullanıcı kaydı',
    description: 'Ayşe Demir platforma katıldı.',
    createdAt: '2026-08-02T16:42:00.000Z',
  },
  {
    id: 'act_listing_1',
    kind: 'listing',
    title: 'Yeni ilan',
    description: '“AI CRM — Seed turu” yayınlandı.',
    createdAt: '2026-08-02T15:18:00.000Z',
  },
  {
    id: 'act_payment_1',
    kind: 'payment',
    title: 'Yeni ödeme',
    description: 'Vitrin paketi ödemesi onaylandı (₺2.490).',
    createdAt: '2026-08-02T14:05:00.000Z',
  },
  {
    id: 'act_verification_1',
    kind: 'verification',
    title: 'Yeni doğrulama',
    description: 'Yatırımcı doğrulama başvurusu alındı.',
    createdAt: '2026-08-02T12:50:00.000Z',
  },
  {
    id: 'act_complaint_1',
    kind: 'complaint',
    title: 'Yeni şikâyet',
    description: 'İlan içeriği hakkında moderasyon talebi açıldı.',
    createdAt: '2026-08-02T11:22:00.000Z',
  },
];

export const MOCK_ADMIN_QUICK_ACTIONS: AdminQuickActionItem[] = [
  {
    id: 'users',
    label: 'Kullanıcıları görüntüle',
    description: 'Üye listesi ve hesap durumları',
    href: ADMIN_ROUTES.users,
    icon: Users,
  },
  {
    id: 'listings',
    label: 'İlanları yönet',
    description: 'Yayın, askıya alma ve inceleme',
    href: ADMIN_ROUTES.listings,
    icon: Megaphone,
  },
  {
    id: 'verifications',
    label: 'Doğrulamaları incele',
    description: 'Bekleyen doğrulama kuyruğu',
    href: ADMIN_ROUTES.verifications,
    icon: BadgeCheck,
  },
  {
    id: 'packages',
    label: 'Kupon oluştur',
    description: 'İndirim ve kampanya kodları',
    href: ADMIN_ROUTES.packages,
    icon: Ticket,
  },
  {
    id: 'notifications',
    label: 'Toplu bildirim gönder',
    description: 'Platform duyurusu yayınla',
    href: ADMIN_ROUTES.notifications,
    icon: Bell,
  },
];

export const MOCK_ADMIN_POPULAR_CATEGORIES: AdminCategoryStatItem[] = [
  { id: 'cat_invest', name: 'Yatırım', listingCount: 128, sharePercent: 34 },
  { id: 'cat_franchise', name: 'Franchise İlanları', listingCount: 86, sharePercent: 23 },
  { id: 'cat_jobs', name: 'İş ilanı', listingCount: 72, sharePercent: 19 },
  { id: 'cat_partner', name: 'Ortaklık', listingCount: 54, sharePercent: 14 },
  { id: 'cat_startup', name: 'Startup', listingCount: 36, sharePercent: 10 },
];

export const MOCK_ADMIN_TOP_LISTINGS: AdminTopListingRow[] =
  weekly.top_viewed_listings;

export const MOCK_ADMIN_REVENUE_CATEGORIES: AdminRevenueCategoryItem[] = [
  { id: 'rev_invest', name: 'Yatırım', revenue: 118400, growthPercent: 14 },
  { id: 'rev_franchise', name: 'Franchise İlanları', revenue: 86400, growthPercent: 9 },
  { id: 'rev_placement', name: 'Vitrin paketleri', revenue: 51200, growthPercent: 21 },
  { id: 'rev_jobs', name: 'İş ilanı', revenue: 30400, growthPercent: 4 },
];

export const ADMIN_OVERVIEW_CARD_ICONS = {
  total_users: Users,
  total_listings: Megaphone,
  pending_verifications: BadgeCheck,
  daily_revenue: CreditCard,
  active_listings: Megaphone,
  pending_complaints: Flag,
} as const;

export const MOCK_ADMIN_SYSTEM_STATUS: AdminSystemStatus = {
  label: 'Sistem durumu',
  items: [
    { id: 'online_users', label: 'Çevrim içi kullanıcılar', value: 125 },
    { id: 'active_listings', label: 'Aktif ilanlar', value: 248 },
    { id: 'pending_verifications', label: 'Bekleyen doğrulamalar', value: 12 },
    { id: 'pending_payments', label: 'Bekleyen ödemeler', value: 4 },
  ],
};

export function getMockAdminOverviewSnapshot(): AdminOverviewSnapshot {
  return {
    cards: MOCK_ADMIN_OVERVIEW_CARDS,
    charts: MOCK_ADMIN_OVERVIEW_CHARTS,
    activities: MOCK_ADMIN_ACTIVITIES,
    popularCategories: MOCK_ADMIN_POPULAR_CATEGORIES,
    topListings: MOCK_ADMIN_TOP_LISTINGS,
    revenueCategories: MOCK_ADMIN_REVENUE_CATEGORIES,
  };
}
