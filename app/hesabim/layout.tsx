import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountPanelLayout } from '@/features/account/layout/AccountPanelLayout';

export const metadata = {
  title: 'Hesabım — Girisimbee',
};

export default async function HesabimLayout({ children }: { children: ReactNode }) {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return <AccountPanelLayout>{children}</AccountPanelLayout>;
}
