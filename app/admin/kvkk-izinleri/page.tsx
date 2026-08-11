import { Suspense } from 'react';
import { AdminKvkkConsentsView } from '@/features/admin/panel/components/AdminKvkkConsentsView';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';

export const metadata = {
  title: 'KVKK İzin Kayıtları — Admin — Girisimbee',
};

export default function AdminKvkkConsentsPage() {
  return (
    <Suspense fallback={<AdminLoadingState />}>
      <AdminKvkkConsentsView />
    </Suspense>
  );
}
