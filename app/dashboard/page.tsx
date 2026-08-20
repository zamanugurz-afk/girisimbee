import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountDashboard } from '@/features/account/components/AccountDashboard';
import { loadAccountHubPage } from '@/features/account/lib/load-account-hub-page';
import { loadFollowNetworkPage } from '@/features/profiles/lib/load-follow-network-page';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Genel Bakış — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardOverviewPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const [{ view, stats }, network] = await Promise.all([
    loadAccountHubPage(user),
    loadFollowNetworkPage(user.id),
  ]);

  return (
    <>
      <DashboardPageHeader
        title="Genel Bakış"
        description="Hesap bilgilerinizi yönetin, ilanlarınızı takip edin ve ağınızı güçlendirin."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountDashboard
          view={view}
          stats={stats}
          followers={network.followers}
          following={network.following}
          followersCount={network.followersCount}
          followingCount={network.followingCount}
        />
      </div>
    </>
  );
}
