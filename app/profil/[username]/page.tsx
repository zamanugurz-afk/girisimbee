import { notFound } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { PublicProfilePageView } from '@/components/girisimco/profile/public-profile-view';
import { loadPublicProfile } from '@/features/profiles/lib/public-profile.loader';
import type { UserId } from '@/lib/domain/ids';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const data = await loadPublicProfile(username);
  if (!data) {
    return { title: 'Profil — Girisimbee' };
  }
  return {
    title: `${data.profile.displayName} — Girisimbee`,
    description: data.profile.headline ?? data.profile.bio?.slice(0, 160),
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession();
  const data = await loadPublicProfile(username, session?.id as UserId | undefined);

  if (!data) {
    notFound();
  }

  return <PublicProfilePageView data={data} />;
}
