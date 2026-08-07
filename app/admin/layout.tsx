import type { ReactNode } from 'react';
import { requireAdminSession } from '@/features/admin/lib/require-admin';
import { AdminLayout } from '@/features/admin/panel/components/AdminLayout';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Yönetim — GirisimBee',
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();
  return <AdminLayout>{children}</AdminLayout>;
}
