/**
 * Default OAuth bootstrap consents — must NOT auto-accept legal texts.
 * User completes /auth/yasal-onay before terms/privacy/cookies/kvkk ack are true.
 */
import type { SignUpConsents } from '@/features/authentication/types/auth.types';

export const DEFAULT_OAUTH_CONSENTS: SignUpConsents = {
  acceptTerms: false,
  acceptKvkk: false,
  acceptPrivacy: false,
  acceptCookies: false,
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
