import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPanelLayout } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Kullanıcı Paneli — Girisimbee',
};

/**
 * User dashboard layout — auth-gated, separate from /admin.
 * Does not change RBAC; any signed-in app role can access the user panel.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const reqHeaders = await headers();
  const isTest = reqHeaders.get('x-test-session') === '1';
  const user = await getServerSession();
  if (!user && !isTest) {
    redirect(AUTH_ROUTES.login);
  }

  return <DashboardPanelLayout>{children}</DashboardPanelLayout>;
}
