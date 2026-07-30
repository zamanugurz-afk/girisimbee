import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminReportsView } from '@/components/girisimco/admin/admin-reports-view';

export const metadata = { title: 'Raporlar — Yönetim' };

export default function AdminReportsPage() {
  return (
    <AdminShell title="Raporlar" description="Bildirilen kullanıcılar, ilanlar ve şirketler">
      <AdminReportsView />
    </AdminShell>
  );
}
