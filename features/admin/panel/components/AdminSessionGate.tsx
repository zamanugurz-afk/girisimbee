'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useAuthorization } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES, loginUrl } from '@/features/authentication/constants/routes';
import { AdminLayout } from '@/features/admin/panel/components/AdminLayout';

/**
 * Client-side admin gate — avoids RSC getServerSession cookie misses that
 * bounce sticky sessions to /giris (same class of bug as Mesajlarım).
 * Middleware still enforces role when the server session is present.
 */
export function AdminSessionGate({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isAdmin } = useAuthorization();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      window.location.replace(loginUrl('/admin'));
      return;
    }
    if (!isAdmin) {
      window.location.replace(AUTH_ROUTES.dashboard);
      return;
    }
    setReady(true);
  }, [isLoading, isAuthenticated, user, isAdmin]);

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yönetim paneli yükleniyor…
        </p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
