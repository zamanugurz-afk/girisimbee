import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminSearchView } from '@/components/girisimco/admin/admin-search-view';

export const metadata = { title: 'Arama — Yönetim' };

export default function AdminSearchPage() {
  return (
    <AdminShell title="Global Arama" description="Kullanıcı, şirket ve ilanlarda ara">
      <AdminSearchView />
    </AdminShell>
  );
}
