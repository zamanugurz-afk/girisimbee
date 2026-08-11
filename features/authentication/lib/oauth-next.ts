import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { resolveAuthCookieDomain } from '@/lib/supabase/cookie-options';

export const OAUTH_NEXT_COOKIE = 'gc_oauth_next';

/** Persist post-login destination for the OAuth round-trip (no query on redirectTo). */
export function setOAuthNextCookie(next: string): void {
  if (typeof document === 'undefined') return;
  const path = next.startsWith('/') ? next : AUTH_ROUTES.home;
  const domain = resolveAuthCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; Path=/; Max-Age=600; SameSite=Lax${domainPart}`;
}

export function clearOAuthNextCookie(): void {
  if (typeof document === 'undefined') return;
  const domain = resolveAuthCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${OAUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${domainPart}`;
  document.cookie = `${OAUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
