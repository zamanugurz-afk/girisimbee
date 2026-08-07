import { redirect } from 'next/navigation';
import { MyListingsView } from '@/components/girisimco/my-listings/my-listings-view';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata = {
  title: 'İlanlarım — Girisimbee',
  description: 'Oluşturduğunuz ilanları yönetin.',
};

export default async function MyListingsPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return <MyListingsView />;
}
