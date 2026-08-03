'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GcPageTransition } from '@/components/girisimco/ui/gc-page-transition';
import { SiteChrome } from '@/components/girisimco/site-chrome';
import { AuthProvider } from '@/features/authentication/providers/auth-provider';
import type { SessionUser } from '@/features/authentication/types/auth.types';
import { FavoritesProvider } from '@/features/favorites/providers/favorites-provider';

export function AppProviders({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <AuthProvider initialUser={initialUser}>
          <FavoritesProvider>
            <TooltipProvider delayDuration={150}>
              <SiteChrome>
                <GcPageTransition>{children}</GcPageTransition>
              </SiteChrome>
              <Toaster
                position="bottom-right"
                theme="system"
                richColors
                closeButton
                toastOptions={{
                  classNames: {
                    toast:
                      'rounded-xl border border-border bg-card text-card-foreground shadow-pop',
                  },
                }}
              />
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
