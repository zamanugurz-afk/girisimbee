import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { CareerProfilePage } from '@/features/career-profile/components/career-profile-page';
import { CAREER_PROFILE_PAGE_TITLE } from '@/features/career-profile/copy';
import { loadCareerProfilePage } from '@/features/career-profile/load-career-profile-page';

export const metadata = {
  title: 'Kariyer Profilim — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardKariyerProfilimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const data = await loadCareerProfilePage(user.id);

  return (
    <>
      <DashboardPageHeader
        title={CAREER_PROFILE_PAGE_TITLE}
        description="Kariyer bilgilerinizi tamamlayarak daha doğru eşleşmeler bulun."
      />
      <div className="px-5 py-8 sm:px-8">
        <CareerProfilePage data={data} displayName={user.displayName} />
      </div>
    </>
  );
}
