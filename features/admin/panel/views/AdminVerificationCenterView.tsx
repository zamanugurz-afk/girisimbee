'use client';

import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminVerificationsView as LiveVerificationsView } from '@/components/girisimco/admin/admin-verifications-view';

export function AdminVerificationCenterView() {
  return (
    <AdminPageShell
      title="Doğrulamalar"
      description="Canlı başvuru / doğrulama kuyruğu — applications API."
    >
      <LiveVerificationsView />
    </AdminPageShell>
  );
}
