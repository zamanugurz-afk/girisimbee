'use client';

import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardMessages } from '@/features/messaging/components/dashboard/DashboardMessages';
import { DashboardPageHeader } from '@/features/dashboard/panel';

/**
 * Canonical Mesajlarım — client-gated (same pattern as /iletisim-talepleri).
 */
export default function MesajlarimPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      window.location.replace(
        `${AUTH_ROUTES.login}?next=${encodeURIComponent('/mesajlarim')}`,
      );
      return;
    }
    setReady(true);
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-5 py-16">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Mesajlar yükleniyor…
        </p>
      </div>
    );
  }

  return (
    <>
      <DashboardPageHeader
        title="Mesajlarım"
        description="Gelen kutusu, gönderilenler ve arşiv. Destek ekibi yanıtları da burada görünür."
      />
      <div className="px-5 py-8 sm:px-8">
        <Suspense
          fallback={
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[120px] animate-pulse rounded-2xl bg-muted/70" />
              ))}
            </div>
          }
        >
          <DashboardMessages />
        </Suspense>
      </div>
    </>
  );
}
