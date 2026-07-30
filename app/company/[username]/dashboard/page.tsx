import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { CompanyDashboardView } from '@/components/girisimco/company/company-dashboard-view';

interface CompanyDashboardPageProps {
  params: Promise<{ username: string }>;
}

export default async function CompanyDashboardPage({ params }: CompanyDashboardPageProps) {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  const { username } = await params;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-20 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Şirket Paneli
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">@{username}</p>
      </div>
      <CompanyDashboardView slug={username} />
    </main>
  );
}
