/**
 * Default OAuth bootstrap consents.
 * Explicit /auth/yasal-onay gate ships with account legal-acceptance API;
 * until then keep membership consents true so Google login is not blocked.
 */
import type { SignUpConsents } from '@/features/authentication/types/auth.types';

export const DEFAULT_OAUTH_CONSENTS: SignUpConsents = {
  acceptTerms: true,
  acceptKvkk: true,
  acceptPrivacy: true,
  acceptCookies: true,
  consentCommercial: false,
  consentSms: false,
  consentEmail: false,
};

/** Split Google `full_name` into first / last name */
export function splitFullName(fullName: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return { firstName: null, lastName: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export const OAUTH_LEGAL_ACCEPTANCE_PATH = '/auth/yasal-onay';
