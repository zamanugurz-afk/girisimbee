export const AUTH_ROUTES = {
  login: '/giris',
  register: '/kayit',
  forgotPassword: '/sifremi-unuttum',
  resetPassword: '/sifre-sifirla',
  /** @deprecated Use AUTH_ROUTES.resetPassword — kept for old email links */
  resetPasswordLegacy: '/sifre-yenile',
  verifyEmail: '/eposta-dogrula',
  callback: '/auth/callback',
  dashboard: '/dashboard',
  account: '/hesabim',
  logout: '/auth/signout',
} as const;

/** Routes accessible without authentication */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/ilan',
  '/kategori',
  '/investors',
  '/invest',
  '/jobs',
  '/hire',
  '/partners',
  '/dijital-ai',
  '/franchise',
  '/market',
  '/ara',
  '/kesfet',
  '/giris',
  '/kayit',
  '/sifremi-unuttum',
  '/sifre-sifirla',
  '/sifre-yenile',
  '/eposta-dogrula',
  '/yasal',
  '/auth/callback',
  '/auth/signout',
] as const;

/** Redirect authenticated users away from these */
export const GUEST_ONLY_ROUTES = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.register,
  AUTH_ROUTES.forgotPassword,
] as const;

/** Require authentication */
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/hesabim',
  '/mesajlar',
  '/ilan/olustur',
  '/ilanlarim',
  '/favoriler',
  '/bildirimler',
  '/ayarlar',
  '/admin',
] as const;

/** Public profile pages: /profil/[username] or /uye/[userId] */
export function isPublicProfileRoute(pathname: string): boolean {
  return /^\/profil\/[^/]+$/.test(pathname) || /^\/uye\/[^/]+$/.test(pathname);
}

export function isProtectedProfileRoute(pathname: string): boolean {
  return pathname === '/profil';
}

/** Public company pages: /company/[username] */
export function isPublicCompanyRoute(pathname: string): boolean {
  return /^\/company\/[^/]+$/.test(pathname) && pathname !== '/company/create';
}

export function isProtectedCompanyRoute(pathname: string): boolean {
  return pathname === '/company/create' || /^\/company\/[^/]+\/(dashboard|settings)$/.test(pathname);
}

/** Minimum role: moderator */
export const MODERATOR_ROUTE_PREFIXES = ['/moderasyon'] as const;

/** Minimum role: admin */
export const ADMIN_ROUTE_PREFIXES = ['/admin'] as const;

/** İkinciBazar token routes — separate product, not Girisimco auth */
export const LEGACY_TOKEN_ROUTE_PATTERN = /^\/[^/]+\/(deals|listings|products|categories|favorites|analytics|alerts|sources|settings)/;

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPublicRoute(pathname: string): boolean {
  if (pathname.startsWith('/api/')) return true;
  if (LEGACY_TOKEN_ROUTE_PATTERN.test(pathname)) return true;
  if (matchesPrefix(pathname, ['/auth/'])) return true;
  return matchesPrefix(pathname, PUBLIC_ROUTE_PREFIXES);
}

export function isProtectedRoute(pathname: string): boolean {
  if (isPublicProfileRoute(pathname)) return false;
  if (isPublicCompanyRoute(pathname)) return false;
  if (isProtectedProfileRoute(pathname)) return true;
  if (isProtectedCompanyRoute(pathname)) return true;
  return matchesPrefix(pathname, PROTECTED_ROUTE_PREFIXES);
}

export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.includes(pathname as (typeof GUEST_ONLY_ROUTES)[number]);
}

/** Skip Supabase auth in middleware for fully public document routes. */
export function needsMiddlewareAuth(pathname: string): boolean {
  if (pathname.startsWith('/api/')) {
    return /^\/api\/listings\/[^/]+\/publish$/.test(pathname);
  }
  if (isPublicRoute(pathname)) return false;
  if (isPublicProfileRoute(pathname)) return false;
  if (isPublicCompanyRoute(pathname)) return false;
  return (
    isProtectedRoute(pathname)
    || isGuestOnlyRoute(pathname)
    || matchesPrefix(pathname, MODERATOR_ROUTE_PREFIXES)
    || matchesPrefix(pathname, ADMIN_ROUTE_PREFIXES)
  );
}

export function needsMiddlewareRole(pathname: string): boolean {
  return (
    matchesPrefix(pathname, MODERATOR_ROUTE_PREFIXES)
    || matchesPrefix(pathname, ADMIN_ROUTE_PREFIXES)
  );
}

export function loginUrl(next?: string): string {
  if (!next || next === AUTH_ROUTES.login) return AUTH_ROUTES.login;
  return `${AUTH_ROUTES.login}?next=${encodeURIComponent(next)}`;
}
