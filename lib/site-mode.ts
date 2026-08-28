import { isSiteIpAllowlistEnabled } from '@/lib/site-ip-allowlist';

/**
 * Public site visibility gate.
 *
 * NEXT_PUBLIC_SITE_MODE=maintenance → visitors see /bakim
 * NEXT_PUBLIC_SITE_MODE=live        → full site for everyone
 *
 * Do NOT set live until the owner explicitly asks to open publicly.
 * An IP allowlist keeps production usable for this machine only; everyone
 * else is rewritten to /bakim in middleware.
 *
 * When unset: development → live; production → maintenance until launch.
 */
export type SiteMode = 'live' | 'maintenance';

export function resolveSiteMode(): SiteMode {
  const raw = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (raw === 'maintenance') return 'maintenance';
  return 'live';
}

export function isMaintenanceMode(): boolean {
  return resolveSiteMode() === 'maintenance';
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
