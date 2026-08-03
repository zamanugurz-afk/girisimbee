import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountFavorites } from '@/features/account/components/AccountFavorites';
import { loadAccountFavoritesPage } from '@/features/account/lib/load-account-favorites-page';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Favorilerim — Kullanıcı Paneli — Girisimco',
};

export default async function DashboardFavorilerimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountFavoritesPage(user.id);

  return (
    <>
      <DashboardPageHeader
        title="Favorilerim"
        description="İlanlar, girişimler, şirketler ve yatırımcılardan kaydettikleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountFavorites userId={user.id} initial={initial} />
      </div>
    </>
  );
}
