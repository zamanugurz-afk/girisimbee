/**
 * Public site visibility gate.
 *
 * NEXT_PUBLIC_SITE_MODE=maintenance → visitors see /bakim
 * NEXT_PUBLIC_SITE_MODE=live        → full site
 *
 * When SITE_IP_ALLOWLIST is set, production runs live for those IPs only
 * (non-allowlisted clients are rewritten to /bakim in middleware).
 *
 * When unset: development → live; production → maintenance until launch.
 */
export type SiteMode = 'live' | 'maintenance';

export function resolveSiteMode(): SiteMode {
  // IP-restricted preview = live product surface for allowlisted clients.
  if (process.env.SITE_IP_ALLOWLIST?.trim()) {
    return 'live';
  }

  const raw = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (raw === 'live') return 'live';
  if (raw === 'maintenance') return 'maintenance';
  return process.env.NODE_ENV === 'production' ? 'maintenance' : 'live';
}

export function isMaintenanceMode(): boolean {
  return resolveSiteMode() === 'maintenance';
}

/** Paths that must stay reachable while the public site is gated. */
export function isMaintenanceBypassPath(pathname: string): boolean {
  if (pathname === '/bakim') return true;

  if (pathname.startsWith('/api/')) return true;

  if (pathname.startsWith('/_next/')) return true;

  // Auth round-trips + login / account surfaces (needed while public site is gated)
  if (
    pathname === '/auth/callback'
    || pathname === '/auth/pkce'
    || pathname === '/auth/verify-success'
    || pathname === '/auth/verify-error'
    || pathname === '/auth/signout'
    || pathname === '/auth/yasal-onay'
    || pathname === '/iletisim-talepleri'
    || pathname === '/auth/google-setup'
    || pathname === '/giris'
    || pathname === '/kayit'
    || pathname === '/sifremi-unuttum'
    || pathname === '/sifre-sifirla'
    || pathname === '/sifre-yenile'
    || pathname === '/eposta-dogrula'
    || pathname.startsWith('/dashboard')
    || pathname.startsWith('/admin')
    || pathname.startsWith('/ilan/')
  ) {
    return true;
  }

  // Icons / SEO endpoints
  if (
    pathname === '/favicon.ico'
    || pathname === '/icon.svg'
    || pathname === '/icon.png'
    || pathname === '/icon-192.png'
    || pathname === '/icon-512.png'
    || pathname === '/apple-icon.png'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/robots.txt'
    || pathname === '/sitemap.xml'
    || pathname === '/manifest.webmanifest'
    || pathname === '/manifest.json'
  ) {
    return true;
  }

  // Public brand assets under /brand, /images, etc.
  if (
    pathname.startsWith('/brand/')
    || pathname.startsWith('/images/')
    || pathname.startsWith('/fonts/')
  ) {
    return true;
  }

  return false;
}
