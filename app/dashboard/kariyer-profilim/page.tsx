import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

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

  const query = new URLSearchParams({ category: 'is-bul' });
  if (returnTo) query.set('returnTo', returnTo);
  if (action) query.set('action', action);

  redirect(`/ilan/olustur?${query.toString()}`);
}
