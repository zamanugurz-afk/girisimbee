'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/** Client redirect — avoids server redirect round-trip to /profil/{username}. */
export function ProfileIndexRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(AUTH_ROUTES.login);
      return;
    }
    if (user.username) {
      router.replace(`/profil/${user.username}`);
      return;
    }
    router.replace('/ayarlar');
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center pt-20">
      <p className="text-sm text-muted-foreground">Profil yükleniyor…</p>
    </div>
  );
}
