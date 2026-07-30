import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminDashboardView } from '@/components/girisimco/admin/admin-dashboard-view';

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Yönetim Paneli" description="Platform istatistikleri ve yönetim modülleri">
      <AdminDashboardView />
    </AdminShell>
  );
}
