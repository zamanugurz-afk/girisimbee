import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminPackagesView } from '@/components/girisimco/admin/admin-packages-view';

export const metadata = {
  title: 'Paketler — Yönetim',
};

export default function AdminPackagesPage() {
  return (
    <AdminShell
      title="İlan Paketleri"
      description="Ücretsiz ilan limiti, yayın sayacı ve kullanıcı paketlerini yönetin."
    >
      <AdminPackagesView />
    </AdminShell>
  );
}
