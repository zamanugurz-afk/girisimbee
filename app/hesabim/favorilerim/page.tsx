import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountFavorites } from '@/features/account/components/AccountFavorites';
import { loadAccountFavoritesPage } from '@/features/account/lib/load-account-favorites-page';

export const metadata = {
  title: 'Favorilerim — Hesabım — GirisimBee',
};

export default async function HesabimFavorilerimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountFavoritesPage(user.id);

  return (
    <>
      <AccountHeader
        title="Favorilerim"
        description="İlanlar, girişimler, şirketler ve yatırımcılardan kaydettikleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountFavorites userId={user.id} initial={initial} />
      </div>
    </>
  );
}
