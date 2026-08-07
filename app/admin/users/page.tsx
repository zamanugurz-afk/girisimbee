import { Suspense } from 'react';
import { AdminUsersView } from '@/features/admin/panel/views/AdminUsersView';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';

export const metadata = { title: 'Kullanıcılar — Yönetim' };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminLoadingState />}>
      <AdminUsersView />
    </Suspense>
  );
}
