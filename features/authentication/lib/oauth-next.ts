import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const OAUTH_NEXT_COOKIE = 'gc_oauth_next';

/** Persist post-login destination for the OAuth round-trip (no query on redirectTo). */
export function setOAuthNextCookie(next: string): void {
  if (typeof document === 'undefined') return;
  const path = next.startsWith('/') ? next : AUTH_ROUTES.home;
  document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function clearOAuthNextCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${OAUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
