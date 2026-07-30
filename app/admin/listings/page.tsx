import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminListingsView } from '@/components/girisimco/admin/admin-listings-view';

export const metadata = { title: 'İlanlar — Yönetim' };

export default function AdminListingsPage() {
  return (
    <AdminShell title="İlanlar" description="Yayınla, durdur, arşivle ve yönet">
      <AdminListingsView />
    </AdminShell>
  );
}
