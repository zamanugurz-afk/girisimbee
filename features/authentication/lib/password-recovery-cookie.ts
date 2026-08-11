import { resolveAuthCookieDomain } from '@/lib/supabase/cookie-options';

/** Marks an in-flight password-recovery round-trip (survives lost ?type=recovery). */
export const PASSWORD_RECOVERY_COOKIE = 'gc_password_recovery';

export function setPasswordRecoveryCookie(): void {
  if (typeof document === 'undefined') return;
  const domain = resolveAuthCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=1; Path=/; Max-Age=1800; SameSite=Lax${domainPart}`;
}

export function clearPasswordRecoveryCookie(): void {
  if (typeof document === 'undefined') return;
  const domain = resolveAuthCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${domainPart}`;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
