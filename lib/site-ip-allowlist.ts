import type { NextRequest } from 'next/server';

/**
 * Optional production preview gate: SITE_IP_ALLOWLIST=1.2.3.4,5.6.7.8
 * When set, only those client IPs see the live site; others get /bakim.
 * Empty / unset → no IP gate (site-mode handles live vs bakim).
 */
export function getSiteIpAllowlist(): string[] {
  const raw = process.env.SITE_IP_ALLOWLIST?.trim();
  if (!raw) return [];
  return raw
    .split(/[\s,;]+/)
    .map((ip) => ip.trim())
    .filter(Boolean);
}

export function isSiteIpAllowlistEnabled(): boolean {
  return getSiteIpAllowlist().length > 0;
}

/** Best-effort client IP behind Vercel / proxies. */
export function getRequestClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const vercel = request.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercel) {
    const first = vercel.split(',')[0]?.trim();
    if (first) return first;
  }
  return null;
}

export function isClientIpAllowlisted(request: NextRequest): boolean {
  const allowlist = getSiteIpAllowlist();
  if (allowlist.length === 0) return true;
  const ip = getRequestClientIp(request);
  if (!ip) return false;
  return allowlist.includes(ip);
}
