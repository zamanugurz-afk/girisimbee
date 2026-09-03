import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

interface CompanySettingsPageProps {
  params: Promise<{ username: string }>;
}

export const metadata = {
  title: 'Şirket Ayarları — Girisimbee',
};

export default async function CompanySettingsPage({ params }: CompanySettingsPageProps) {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  const { username } = await params;
  redirect(`/company/${username}/dashboard?tab=settings`);
}
