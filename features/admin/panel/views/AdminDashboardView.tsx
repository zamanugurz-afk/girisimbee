'use client';

import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminOverviewCards } from '@/features/admin/panel/components/AdminOverviewCards';
import { AdminOverviewCharts } from '@/features/admin/panel/components/AdminOverviewCharts';
import { AdminActivityFeed } from '@/features/admin/panel/components/AdminActivityFeed';
import { AdminQuickActions } from '@/features/admin/panel/components/AdminQuickActions';
import { AdminCategoryStats } from '@/features/admin/panel/components/AdminCategoryStats';
import { AdminTopListings } from '@/features/admin/panel/components/AdminTopListings';
import { AdminRevenueStats } from '@/features/admin/panel/components/AdminRevenueStats';
import {
  getMockAdminOverviewSnapshot,
  MOCK_ADMIN_QUICK_ACTIONS,
  MOCK_ADMIN_SYSTEM_STATUS,
} from '@/features/admin/panel/mock/admin-overview.mock';
import { AdminSystemStatus } from '@/features/admin/panel/components/AdminSystemStatus';

export function AdminDashboardView() {
  const snapshot = getMockAdminOverviewSnapshot();

  return (
    <AdminPageShell
      title="Yönetim Merkezi"
      description="Girişimco platformunun tüm operasyonlarını yönetin."
    >
      <AdminSystemStatus status={MOCK_ADMIN_SYSTEM_STATUS} />

      <AdminOverviewCards cards={snapshot.cards} />

      <AdminOverviewCharts charts={snapshot.charts} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminActivityFeed items={snapshot.activities} />
        <AdminQuickActions actions={MOCK_ADMIN_QUICK_ACTIONS} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCategoryStats categories={snapshot.popularCategories} />
        <AdminTopListings listings={snapshot.topListings} />
        <AdminRevenueStats categories={snapshot.revenueCategories} />
      </div>
    </AdminPageShell>
  );
}
