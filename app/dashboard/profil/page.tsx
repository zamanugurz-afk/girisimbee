import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountProfile } from '@/features/account/components/AccountProfile';
import { loadAccountProfilePage } from '@/features/account/lib/load-account-profile-page';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Profil — Kullanıcı Paneli — Girisimco',
};

export default async function DashboardProfilPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountProfilePage(user.id);

  return (
    <>
      <DashboardPageHeader
        title="Profil"
        description="Hesap bilgilerinizi görüntüleyin ve güncelleyin."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountProfile userId={user.id} initial={initial} />
      </div>
    </>
  );
}
