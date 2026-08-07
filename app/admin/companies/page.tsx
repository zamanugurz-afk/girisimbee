import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminCompaniesView } from '@/components/girisimco/admin/admin-companies-view';

export const metadata = { title: 'Şirketler — Yönetim' };

export default function AdminCompaniesPage() {
  return (
    <AdminPageShell title="Şirketler" description="Doğrula, askıya al ve yönet">
      <AdminCompaniesView />
    </AdminPageShell>
  );
}
