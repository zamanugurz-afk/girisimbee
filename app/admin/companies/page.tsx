import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminCompaniesView } from '@/components/girisimco/admin/admin-companies-view';

export const metadata = { title: 'Şirketler — Yönetim' };

export default function AdminCompaniesPage() {
  return (
    <AdminShell title="Şirketler" description="Doğrula, askıya al ve yönet">
      <AdminCompaniesView />
    </AdminShell>
  );
}
