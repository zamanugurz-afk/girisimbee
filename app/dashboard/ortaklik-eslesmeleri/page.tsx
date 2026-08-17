import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { PartnershipMatchResults } from '@/features/partnership-matching/presentation/partnership-match-results';
import { loadPartnershipMatchesPage } from '@/features/partnership-matching/load-partnership-matches-page';
import { PARTNERSHIP_MATCH_PAGE_TITLE } from '@/features/partnership-matching/presentation/partnership-match-copy';
import { PARTNERSHIP_MATCH_PAGE_CLASS } from '@/features/partnership-matching/presentation/partnership-match-layout';

export const metadata = {
  title: 'Ortaklık Eşleşmeleri — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardOrtaklikEslesmeleriPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const result = await loadPartnershipMatchesPage(user.id);

  return (
    <>
      <DashboardPageHeader title={PARTNERSHIP_MATCH_PAGE_TITLE} />
      <div className={PARTNERSHIP_MATCH_PAGE_CLASS}>
        <PartnershipMatchResults result={result} />
      </div>
    </>
  );
}
