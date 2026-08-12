import type { ReactNode } from 'react';
import { AdminSessionGate } from '@/features/admin/panel/components/AdminSessionGate';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Yönetim — GirisimBee',
};

/**
 * Admin shell — client-gated so sticky browser sessions are not bounced by
 * intermittent RSC cookie reads (requireAdminSession redirect).
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminSessionGate>{children}</AdminSessionGate>;
}
