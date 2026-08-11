'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { OwnerContactRequestsInbox } from '@/features/contact-requests/components/owner-contact-requests-inbox';

/**
 * Account-menu destination for iletişim talepleri.
 * Client-gated so a sticky browser session still opens the page even when
 * RSC getServerSession briefly misses cookies (dashboard layout redirect).
 */
export default function IletisimTalepleriPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      window.location.replace(
        `${AUTH_ROUTES.login}?next=${encodeURIComponent('/iletisim-talepleri')}`,
      );
      return;
    }
    setReady(true);
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !ready) {
    return (
      <main className="gc-header-offset mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </p>
      </main>
    );
  }

  return (
    <main className="gc-header-offset mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Hesabım
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          İletişim Talepleri
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bugüne kadar gelen bekleyen, kabul ve red tüm talepleriniz burada. Kabul sonrası{' '}
          <Link href="/dashboard/mesajlarim" className="text-primary underline-offset-2 hover:underline">
            Mesajlarım
          </Link>{' '}
          üzerinden yanıtlayın.
        </p>
      </div>
      <OwnerContactRequestsInbox />
    </main>
  );
}
