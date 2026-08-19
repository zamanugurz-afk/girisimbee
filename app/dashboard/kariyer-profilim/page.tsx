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

  // Kariyer Profilim is deprecated; redirect to unified Job Seeker listing creation
  redirect('/ilan/olustur?category=is-bul');
}
