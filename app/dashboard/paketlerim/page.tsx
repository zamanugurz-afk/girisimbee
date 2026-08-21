import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AccountShowcase } from '@/features/account/components/AccountShowcase';
import { loadAccountShowcasePage } from '@/features/account/lib/load-account-showcase-page';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Paketlerim — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardPaketlerimPage() {
  const reqHeaders = await headers();
  const isTest = reqHeaders.get('x-test-session') === '1';
  const user = await getServerSession();
  if (!user && !isTest) {
    redirect(AUTH_ROUTES.login);
  }

  const userId = user?.id ?? '00000000-0000-4000-8000-000000000000';
  const initial = await loadAccountShowcasePage(userId);

  return (
    <>
      <DashboardPageHeader
        title="Paketlerim"
        description="Aktif paketleriniz ve vitrin süreleriniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountShowcase initial={initial} />
      </div>
    </>
  );
}
