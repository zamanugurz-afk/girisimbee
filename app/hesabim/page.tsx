import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountDashboard } from '@/features/account/components/AccountDashboard';
import { loadAccountHubPage } from '@/features/account/lib/load-account-hub-page';

export const metadata = {
  title: 'Hesap Merkezi — Girisimco',
};

export default async function HesabimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { view, stats } = await loadAccountHubPage(user);

  return (
    <>
      <AccountHeader
        title="Hesap Merkezi"
        description="Hesap bilgilerinizi yönetin, ilanlarınızı takip edin ve doğrulama işlemlerinizi tamamlayın."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountDashboard view={view} stats={stats} />
      </div>
    </>
  );
}
