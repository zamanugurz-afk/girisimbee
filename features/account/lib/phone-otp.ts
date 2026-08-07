import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { PHONE_REGEX } from '@/lib/domain/base';

const COOKIE_NAME = 'gc_phone_otp';
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function otpSecret(): string {
  return (
    process.env.PHONE_OTP_SECRET
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || 'GirisimBee-dev-phone-otp'
  );
}

/** Normalize TR phone to digits starting with 90… */
export function normalizeTrPhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s()-]/g, '');
  if (!PHONE_REGEX.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return null;
}

export function formatPhoneDisplay(normalized90: string): string {
  if (normalized90.length !== 12) return normalized90;
  return `+${normalized90.slice(0, 2)} ${normalized90.slice(2, 5)} ${normalized90.slice(5, 8)} ${normalized90.slice(8)}`;
}

function hashCode(code: string, phone: string): string {
  return createHmac('sha256', otpSecret()).update(`${phone}:${code}`).digest('hex');
}

function signPayload(payload: string): string {
  const sig = createHmac('sha256', otpSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySigned(token: string): string | null {
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac('sha256', otpSecret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return payload;
}

export interface PhoneOtpChallenge {
  phone: string;
  hash: string;
  exp: number;
  attempts: number;
}

export function createPhoneOtpChallenge(phone: string): { code: string; token: string; expiresAt: string } {
  const code = String(randomInt(100000, 999999));
  const challenge: PhoneOtpChallenge = {
    phone,
    hash: hashCode(code, phone),
    exp: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
  const payload = Buffer.from(JSON.stringify(challenge), 'utf8').toString('base64url');
  return {
    code,
    token: signPayload(payload),
    expiresAt: new Date(challenge.exp).toISOString(),
  };
}

export function readPhoneOtpChallenge(token: string | undefined): PhoneOtpChallenge | null {
  if (!token) return null;
  const payload = verifySigned(token);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PhoneOtpChallenge;
    if (!parsed?.phone || !parsed?.hash || !parsed?.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializePhoneOtpChallenge(challenge: PhoneOtpChallenge): string {
  const payload = Buffer.from(JSON.stringify(challenge), 'utf8').toString('base64url');
  return signPayload(payload);
}

export type PhoneOtpVerifyResult =
  | { ok: true; phone: string }
  | { ok: false; error: string; challenge?: PhoneOtpChallenge };

export function verifyPhoneOtpCode(
  token: string | undefined,
  code: string,
): PhoneOtpVerifyResult {
  const challenge = readPhoneOtpChallenge(token);
  if (!challenge) {
    return { ok: false, error: 'Doğrulama kodu süresi dolmuş. Yeni kod isteyin.' };
  }
  if (Date.now() > challenge.exp) {
    return { ok: false, error: 'Doğrulama kodu süresi dolmuş. Yeni kod isteyin.' };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'Çok fazla deneme. Yeni kod isteyin.' };
  }

  const next: PhoneOtpChallenge = { ...challenge, attempts: challenge.attempts + 1 };
  const expected = hashCode(code.trim(), challenge.phone);
  const a = Buffer.from(expected);
  const b = Buffer.from(challenge.hash);
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) {
    return { ok: false, error: 'Kod hatalı. Tekrar deneyin.', challenge: next };
  }
  return { ok: true, phone: challenge.phone };
}

export const PHONE_OTP_COOKIE = COOKIE_NAME;
export const PHONE_OTP_COOKIE_MAX_AGE = Math.floor(OTP_TTL_MS / 1000);

export function shouldExposePhoneOtpDebugCode(): boolean {
  return (
    process.env.NODE_ENV !== 'production'
    || process.env.PHONE_OTP_DEBUG === '1'
    || process.env.NEXT_PUBLIC_PHONE_OTP_DEBUG === '1'
  );
}
