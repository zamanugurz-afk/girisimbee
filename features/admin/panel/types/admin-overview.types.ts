import type { LucideIcon } from 'lucide-react';
import type { AdminReportChartPoint, AdminTopListingRow } from '@/features/admin/panel/types/admin-panel.types';

export type AdminOverviewCardId =
  | 'total_users'
  | 'total_listings'
  | 'pending_verifications'
  | 'daily_revenue'
  | 'active_listings'
  | 'pending_complaints';

export type AdminOverviewCardItem = {
  id: AdminOverviewCardId;
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
};

export type AdminActivityKind =
  | 'user'
  | 'listing'
  | 'payment'
  | 'verification'
  | 'complaint';

export type AdminActivityItem = {
  id: string;
  kind: AdminActivityKind;
  title: string;
  description: string;
  createdAt: string;
};

export type AdminQuickActionItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type AdminCategoryStatItem = {
  id: string;
  name: string;
  listingCount: number;
  sharePercent: number;
};

export type AdminRevenueCategoryItem = {
  id: string;
  name: string;
  revenue: number;
  growthPercent: number;
};

export type AdminOverviewChartSeries = {
  id: string;
  title: string;
  description: string;
  dataKey: keyof Omit<AdminReportChartPoint, 'label'>;
  color: string;
  data: AdminReportChartPoint[];
};

export type AdminOverviewSnapshot = {
  cards: Omit<AdminOverviewCardItem, 'icon'>[];
  charts: AdminOverviewChartSeries[];
  activities: AdminActivityItem[];
  popularCategories: AdminCategoryStatItem[];
  topListings: AdminTopListingRow[];
  revenueCategories: AdminRevenueCategoryItem[];
};
