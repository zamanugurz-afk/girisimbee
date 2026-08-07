import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountMyListings } from '@/features/account/components/AccountMyListings';
import { loadAccountListingsPage } from '@/features/account/lib/load-account-listings-page';

export const metadata = {
  title: 'İlanlarım — Hesabım — Girisimbee',
};

export default async function HesabimIlanlarimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountListingsPage(user.id);

  return (
    <>
      <AccountHeader
        title="İlanlarım"
        description="İlanlarınızı görüntüleyin, filtreleyin ve yönetin."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountMyListings initial={initial} />
      </div>
    </>
  );
}
