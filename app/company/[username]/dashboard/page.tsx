import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { CompanyPanelLayout } from '@/features/companies/components/CompanyPanelLayout';
import { CompanyDashboardView } from '@/components/girisimco/company/company-dashboard-view';

interface CompanyDashboardPageProps {
  params: Promise<{ username: string }>;
}

export const metadata = {
  title: 'Şirket Paneli — Girisimbee',
};

export default async function CompanyDashboardPage({ params }: CompanyDashboardPageProps) {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  const { username } = await params;

  return (
    <CompanyPanelLayout slug={username}>
      <CompanyDashboardView slug={username} />
    </CompanyPanelLayout>
  );
}
