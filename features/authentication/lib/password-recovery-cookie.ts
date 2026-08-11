import { legacyAuthCookieDomains } from '@/lib/supabase/cookie-options';

/** Marks an in-flight password-recovery round-trip (email link → /sifre-sifirla). */
export const PASSWORD_RECOVERY_COOKIE = 'gc_password_recovery';

export function setPasswordRecoveryCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=1; Path=/; Max-Age=1800; SameSite=Lax`;
}

export function clearPasswordRecoveryCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  for (const domain of legacyAuthCookieDomains()) {
    document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Domain=${domain}`;
  }
}
