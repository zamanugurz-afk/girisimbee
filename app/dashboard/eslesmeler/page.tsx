import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { CareerMatchResults } from '@/features/matching-engine/components/career-match-results';
import { loadCareerMatchesPage } from '@/features/matching-engine/load-career-matches-page';
import { MATCH_PAGE_TITLE } from '@/features/matching-engine/presentation/career-match-copy';

export const metadata = {
  title: 'Eşleşmeler — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardEslesmelerPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const result = await loadCareerMatchesPage(user.id);

  return (
    <>
      <DashboardPageHeader title={MATCH_PAGE_TITLE} />
      <div className="px-5 py-8 sm:px-8">
        <CareerMatchResults result={result} />
      </div>
    </>
  );
}
