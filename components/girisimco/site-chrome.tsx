'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@/features/shared';
import { LEGACY_TOKEN_ROUTE_PATTERN } from '@/features/authentication/constants/routes';
import { cn } from '@/lib/utils';

const AUTH_PAGES = new Set([
  '/giris',
  '/kayit',
  '/sifremi-unuttum',
  '/sifre-sifirla',
  '/sifre-yenile',
  '/eposta-dogrula',
]);

function usesSiteChrome(pathname: string): boolean {
  if (AUTH_PAGES.has(pathname)) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/auth/')) return false;
  if (LEGACY_TOKEN_ROUTE_PATTERN.test(pathname)) return false;
  return true;
}

/** Mounted once — pathname changes only toggle visibility, never remount header hooks. */
const PersistentSiteHeader = memo(function PersistentSiteHeader() {
  return <SiteHeader />;
});

const PersistentSiteFooter = memo(function PersistentSiteFooter() {
  return <SiteFooter />;
});

/**
 * Persistent site chrome — header/footer stay mounted (hidden on auth/admin)
 * so client navigations do not remount Header hooks/subscriptions.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showChrome = usesSiteChrome(pathname);

  return (
    <>
      <div className={cn(!showChrome && 'hidden')} aria-hidden={!showChrome}>
        <PersistentSiteHeader />
      </div>
      <div className={cn(showChrome && 'min-h-screen bg-background')}>{children}</div>
      <div className={cn(!showChrome && 'hidden')} aria-hidden={!showChrome}>
        <PersistentSiteFooter />
      </div>
    </>
  );
}
