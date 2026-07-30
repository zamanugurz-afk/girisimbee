import { AdminShell } from '@/components/girisimco/admin/admin-shell';
import { AdminVerificationsView } from '@/components/girisimco/admin/admin-verifications-view';

export const metadata = { title: 'Doğrulama — Yönetim' };

export default function AdminVerificationsPage() {
  return (
    <AdminShell title="Doğrulama" description="Kullanıcı ve şirket doğrulama talepleri">
      <AdminVerificationsView />
    </AdminShell>
  );
}
