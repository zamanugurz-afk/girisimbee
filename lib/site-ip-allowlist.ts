import type { NextRequest } from 'next/server';

/**
 * Production IP preview gate.
 * Include both IPv4 and IPv6 — browsers often hit Vercel over IPv6.
 */
const BUILTIN_PREVIEW_IPS = [
  '159.146.69.219',
  '2a02:ff0:3d10:ddae:1986:abe4:532:6be8',
] as const;

const PREVIEW_COOKIE = 'gb_site_preview';

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,;]+/)
    .map((ip) => normalizeIp(ip.trim()))
    .filter(Boolean);
}

/** Normalize IPv4-mapped IPv6, brackets, and case. */
export function normalizeIp(ip: string): string {
  let trimmed = ip.trim().replace(/^\[|\]$/g, '');
  if (trimmed.toLowerCase().startsWith('::ffff:')) {
    trimmed = trimmed.slice('::ffff:'.length);
  }
  // Compact IPv6 compare: lowercase
  if (trimmed.includes(':')) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

export function getSiteIpAllowlist(): string[] {
  const fromEnv = parseAllowlist(process.env.SITE_IP_ALLOWLIST);
  const onVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  if (onVercel) {
    return [...new Set([...fromEnv, ...BUILTIN_PREVIEW_IPS.map(normalizeIp)])];
  }
  return fromEnv;
}

export function isSiteIpAllowlistEnabled(): boolean {
  return getSiteIpAllowlist().length > 0;
}

/** Collect possible client IPs (Vercel may present IPv6 while we allowlisted IPv4). */
export function getRequestClientIps(request: NextRequest): string[] {
  const found: string[] = [];
  const push = (value: string | null | undefined) => {
    if (!value) return;
    const n = normalizeIp(value);
    if (n && !found.includes(n)) found.push(n);
  };

  // Next.js / Vercel platform IP (most reliable on Edge)
  const platformIp = (request as NextRequest & { ip?: string | null }).ip;
  push(platformIp ?? undefined);

  for (const header of [
    request.headers.get('x-forwarded-for'),
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('cf-connecting-ip'),
  ]) {
    if (!header) continue;
    for (const part of header.split(',')) {
      push(part.trim());
    }
  }

  return found;
}

export function hasPreviewCookie(request: NextRequest): boolean {
  const secret = process.env.SITE_PREVIEW_SECRET?.trim() || 'girisimbee-preview';
  const cookie = request.cookies.get(PREVIEW_COOKIE)?.value;
  return Boolean(cookie && cookie === secret);
}

export function isClientIpAllowlisted(request: NextRequest): boolean {
  if (hasPreviewCookie(request)) return true;

  const allowlist = getSiteIpAllowlist();
  if (allowlist.length === 0) return true;

  const ips = getRequestClientIps(request);
  if (ips.length === 0) return false;
  return ips.some((ip) => allowlist.includes(ip));
}

export { PREVIEW_COOKIE };
