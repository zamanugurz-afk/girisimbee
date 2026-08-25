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

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

export default async function DashboardKariyerProfilimPage(props: PageProps) {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const rawParams = props.searchParams;
  const searchParams = rawParams instanceof Promise ? await rawParams : rawParams || {};
  const returnTo = typeof searchParams.returnTo === 'string' ? searchParams.returnTo : undefined;
  const action = typeof searchParams.action === 'string' ? searchParams.action : undefined;

  const data = await loadCareerProfilePage(user.id);

  return (
    <>
      <DashboardPageHeader
        title={CAREER_PROFILE_PAGE_TITLE}
        description="Kişisel kariyer profilinizi tamamlayarak iş ilanlarına tek tıkla başvurun."
      />
      <div className="px-5 py-8 sm:px-8">
        <CareerProfilePage
          data={data}
          displayName={user.displayName}
          returnTo={returnTo}
          action={action}
        />
      </div>
    </>
  );
}
