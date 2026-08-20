import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { loadAccountHubPage } from '@/features/account/lib/load-account-hub-page';
import { AccountSecurity } from '@/features/account/components/AccountSecurity';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Güvenlik & Doğrulamalar — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardGuvenlikPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { view } = await loadAccountHubPage(user);

  return (
    <>
      <DashboardPageHeader
        title="Güvenlik & Doğrulamalar"
        description="E-posta / SMS doğrulamaları, şifre, oturumlar ve hesap güvenliği işlemleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountSecurity
          emailVerified={view.emailVerified}
          phoneVerified={view.phoneVerified}
        />
      </div>
    </>
  );
}
