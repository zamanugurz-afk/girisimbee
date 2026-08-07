import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountNotifications } from '@/features/account/components/AccountNotifications';
import { loadAccountNotificationsPage } from '@/features/account/lib/load-account-notifications-page';

export const metadata = {
  title: 'Bildirimlerim — Hesabım — GirisimBee',
};

export default async function HesabimBildirimlerimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountNotificationsPage(user.id);

  return (
    <>
      <AccountHeader
        title="Bildirimlerim"
        description="Favoriler, takipler, ilanlar, ödemeler ve doğrulamalarla ilgili anlık bildirimleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountNotifications userId={user.id} initial={initial} />
      </div>
    </>
  );
}
