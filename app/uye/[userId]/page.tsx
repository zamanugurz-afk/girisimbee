import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { PublicProfilePageView } from '@/components/girisimco/profile/public-profile-view';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import { uuidSchema } from '@/lib/domain/validation';

interface MemberProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: MemberProfilePageProps) {
  const { userId } = await params;
  if (!uuidSchema.safeParse(userId).success) {
    return { title: 'Üye — Girisimbee' };
  }
  try {
    const container = getServerContainer(createClient());
    const data = await container.profileService.getPublicProfileByUserId(userId as UserId);
    if (!data) return { title: 'Üye — Girisimbee' };
    return {
      title: `${data.profile.displayName} — Girisimbee`,
      description: data.profile.headline ?? data.profile.bio?.slice(0, 160),
    };
  } catch {
    return { title: 'Üye — Girisimbee' };
  }
}

/** Fallback public member page when username profile is missing or unpublished. */
export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { userId } = await params;
  if (!uuidSchema.safeParse(userId).success) {
    notFound();
  }

  const session = await getServerSession();
  const container = getServerContainer(createClient());
  const viewerId = session?.id as UserId | undefined;
  const data = await container.profileService.getPublicProfileByUserId(
    userId as UserId,
    viewerId,
  );

  if (!data) {
    notFound();
  }

  if (data.profile.username) {
    const canonical = await container.profileService.getPublicProfile(
      data.profile.username,
      viewerId,
    );
    if (canonical) {
      redirect(`/profil/${data.profile.username}`);
    }
  }

  return <PublicProfilePageView data={data} />;
}
