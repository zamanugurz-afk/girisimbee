import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminSearchView } from '@/components/girisimco/admin/admin-search-view';

export const metadata = { title: 'Arama — Yönetim' };

export default function AdminSearchPage() {
  return (
    <AdminPageShell title="Global Arama" description="Kullanıcı, şirket ve ilanlarda ara">
      <AdminSearchView />
    </AdminPageShell>
  );
}
