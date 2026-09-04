import { isSiteIpAllowlistEnabled } from '@/lib/site-ip-allowlist';

/**
 * Public site visibility gate.
 *
 * Site halka tamamen KAPALIDIR (bakım / yapım aşamasında).
 * Sadece localhost geliştirme ortamına açıktır.
 */
export type SiteMode = 'live' | 'maintenance';

export function resolveSiteMode(): SiteMode {
  return 'maintenance';
}

export function isMaintenanceMode(): boolean {
  return true;
}

/** Paths anonymous visitors may hit while the public site is gated. */
export function isMaintenanceBypassPath(pathname: string): boolean {
  if (pathname === '/bakim') return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/brand/')) return true;
  if (pathname.startsWith('/images/')) return true;
  if (pathname.startsWith('/fonts/')) return true;

  return (
    pathname === '/favicon.ico'
    || pathname === '/icon.svg'
    || pathname === '/icon.png'
    || pathname === '/icon-192.png'
    || pathname === '/icon-512.png'
    || pathname === '/apple-icon.png'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/robots.txt'
  );
}
