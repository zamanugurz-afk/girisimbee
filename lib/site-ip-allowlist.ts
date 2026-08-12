import type { NextRequest } from 'next/server';

/**
 * Production IP preview gate.
 * Env SITE_IP_ALLOWLIST merges with built-in IPs (Edge middleware often misses
 * non-NEXT_PUBLIC env at runtime/build, so we keep a code fallback).
 */
const BUILTIN_PREVIEW_IPS = ['159.146.69.219'] as const;

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,;]+/)
    .map((ip) => normalizeIp(ip.trim()))
    .filter(Boolean);
}

/** Normalize IPv4-mapped IPv6 and whitespace. */
export function normalizeIp(ip: string): string {
  const trimmed = ip.trim().replace(/^\[|\]$/g, '');
  if (trimmed.toLowerCase().startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length);
  }
  return trimmed;
}

export function getSiteIpAllowlist(): string[] {
  const fromEnv = parseAllowlist(process.env.SITE_IP_ALLOWLIST);
  // Always merge builtin on Vercel/production so preview works without env/Edge quirks.
  const onVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  if (onVercel) {
    return [...new Set([...fromEnv, ...BUILTIN_PREVIEW_IPS.map(normalizeIp)])];
  }
  return fromEnv;
}

export function isSiteIpAllowlistEnabled(): boolean {
  return getSiteIpAllowlist().length > 0;
}

/** Best-effort client IP behind Vercel / proxies. */
export function getRequestClientIp(request: NextRequest): string | null {
  const candidates = [
    request.headers.get('x-forwarded-for'),
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('cf-connecting-ip'),
  ];
  for (const header of candidates) {
    if (!header) continue;
    const first = header.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
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
