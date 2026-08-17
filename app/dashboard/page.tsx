import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountDashboard } from '@/features/account/components/AccountDashboard';
import { loadAccountHubPage } from '@/features/account/lib/load-account-hub-page';
import { loadCareerProfilePage } from '@/features/career-profile/load-career-profile-page';
import { loadCareerMatchesPage } from '@/features/matching-engine/load-career-matches-page';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Genel Bakış — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardOverviewPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const [{ view, stats }, careerProfile, careerMatches] = await Promise.all([
    loadAccountHubPage(user),
    loadCareerProfilePage(user.id),
    loadCareerMatchesPage(user.id).catch(() => null),
  ]);

  return (
    <>
      <DashboardPageHeader
        title="Genel Bakış"
        description="Hesap bilgilerinizi yönetin, ilanlarınızı takip edin ve doğrulama işlemlerinizi tamamlayın."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountDashboard
          view={view}
          stats={stats}
          careerProfile={careerProfile}
          careerMatches={careerMatches}
        />
      </div>
    </>
  );
}
