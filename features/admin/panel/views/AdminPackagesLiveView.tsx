'use client';

import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminPackagesView as LivePackagesView } from '@/components/girisimco/admin/admin-packages-view';

/** Live packages + coupons management via /api/admin/packages and /api/admin/coupons. */
export function AdminPackagesLiveView() {
  return (
    <AdminPageShell
      title="Paketler"
      description="Canlı abonelik paketleri, aktivasyon ve kupon yönetimi."
    >
      <LivePackagesView />
    </AdminPageShell>
  );
}
