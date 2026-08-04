'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminOverviewCards } from '@/features/admin/panel/components/AdminOverviewCards';
import { AdminQuickActions } from '@/features/admin/panel/components/AdminQuickActions';
import { AdminSystemStatus } from '@/features/admin/panel/components/AdminSystemStatus';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { MOCK_ADMIN_QUICK_ACTIONS } from '@/features/admin/panel/mock/admin-overview.mock';
import { snapshotFromDashboardStats } from '@/features/admin/panel/lib/map-live-admin';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { AdminOverviewSnapshot } from '@/features/admin/panel/types/admin-overview.types';
import type { AdminSystemStatus as SystemStatus } from '@/features/admin/panel/types/admin-system-status.types';
import type { AdminDashboardStats } from '@/features/admin/services/admin.service.interface';

function systemStatusFromStats(stats: AdminDashboardStats): SystemStatus {
  return {
    label: 'Canlı sistem durumu',
    items: [
      { id: 'online_users', label: 'Bugün aktif kullanıcı', value: stats.activeToday },
      { id: 'active_listings', label: 'Yayındaki ilanlar', value: stats.publishedListings },
      { id: 'pending_verifications', label: 'Toplam başvuru', value: stats.totalApplications },
      {
        id: 'pending_payments',
        label: 'Gelir (₺)',
        value: Math.round(stats.revenueCents / 100),
      },
    ],
  };
}

export function AdminDashboardView() {
  const [cards, setCards] = useState<AdminOverviewSnapshot['cards'] | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const stats = await adminApi.getDashboard();
        if (cancelled) return;
        setCards(snapshotFromDashboardStats(stats).cards);
        setSystemStatus(systemStatusFromStats(stats));
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Dashboard yüklenemedi');
          setCards([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminPageShell
      title="Yönetim Merkezi"
      description="Canlı platform metrikleri — kullanıcı, ilan, ödeme ve aktivite."
    >
      {systemStatus ? <AdminSystemStatus status={systemStatus} /> : null}

      {loading ? (
        <AdminLoadingState />
      ) : (
        <AdminOverviewCards cards={cards ?? []} />
      )}

      <AdminQuickActions actions={MOCK_ADMIN_QUICK_ACTIONS} />
    </AdminPageShell>
  );
}
