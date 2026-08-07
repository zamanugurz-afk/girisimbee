import { Suspense } from 'react';
import { AdminListingsView } from '@/features/admin/panel/views/AdminListingsView';

export const metadata = { title: 'İlanlar — Yönetim' };

export default function AdminListingsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-6 text-sm text-muted-foreground lg:px-8">Yükleniyor…</div>}>
      <AdminListingsView />
    </Suspense>
  );
}
