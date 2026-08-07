import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountProfile } from '@/features/account/components/AccountProfile';
import { loadAccountProfilePage } from '@/features/account/lib/load-account-profile-page';

export const metadata = {
  title: 'Profilim — Hesabım — Girisimbee',
};

export default async function HesabimProfilimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const initial = await loadAccountProfilePage(user.id);

  return (
    <>
      <AccountHeader
        title="Profilim"
        description="Hesap bilgilerinizi yönetin ve doğrulama durumunuzu takip edin."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountProfile userId={user.id} initial={initial} />
      </div>
    </>
  );
}
