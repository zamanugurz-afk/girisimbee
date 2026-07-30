import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminUsersView } from '@/components/girisimco/admin/admin-users-view';

export const metadata = { title: 'Kullanıcılar — Yönetim' };

export default function AdminUsersPage() {
  return (
    <AdminShell title="Kullanıcılar" description="Ara, filtrele, askıya al ve yönet">
      <AdminUsersView />
    </AdminShell>
  );
}
