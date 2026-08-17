import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { OwnerContactRequestsInbox } from '@/features/contact-requests/components/owner-contact-requests-inbox';

export const metadata = {
  title: 'İletişim Talepleri — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardIletisimTalepleriPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <>
      <DashboardPageHeader
        title="İletişim Talepleri"
        description="İlanlarınıza gelen iletişim, başvuru ve tanışma taleplerini buradan yönetin."
      />
      <div className="px-5 py-8 sm:px-8">
        <OwnerContactRequestsInbox />
      </div>
    </>
  );
}
