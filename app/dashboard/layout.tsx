import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPanelLayout } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Kullanıcı Paneli — Girisimco',
};

/**
 * User dashboard layout — auth-gated, separate from /admin.
 * Does not change RBAC; any signed-in app role can access the user panel.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return <DashboardPanelLayout>{children}</DashboardPanelLayout>;
}
