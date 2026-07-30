'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/** Client redirect — single transition to /profil/{username}, no server round-trip. */
export default function ProfileIndexPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading || redirectedRef.current) return;
    redirectedRef.current = true;

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

  return null;
}
