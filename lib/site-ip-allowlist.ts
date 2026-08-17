import type { NextRequest } from 'next/server';

/**
 * Production IP preview gate — this office/home connection only.
 * Do not open the public internet until the owner explicitly asks.
 *
 * IPv4 is stable. IPv6 privacy addresses rotate under the same /64.
 */
const BUILTIN_PREVIEW_IPS = [
  '159.146.69.219',
  '95.2.61.196',
  '2a02:ff0:3d10:ddae:adcd:8276:398:8e2e',
  '2a02:ff0:3d10:ddae::/64',
] as const;

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,;]+/)
    .map((ip) => normalizeIp(ip.trim()))
    .filter(Boolean);
}

/** Normalize IPv4-mapped IPv6, brackets, CIDR, and case. */
export function normalizeIp(ip: string): string {
  let trimmed = ip.trim().replace(/^\[|\]$/g, '');
  if (trimmed.toLowerCase().startsWith('::ffff:')) {
    trimmed = trimmed.slice('::ffff:'.length);
  }
  if (trimmed.includes(':')) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

export function ipMatchesAllowlistEntry(ip: string, allowed: string): boolean {
  const client = normalizeIp(ip);
  const rule = normalizeIp(allowed);
  if (!client || !rule) return false;
  if (client === rule) return true;

  const cidr = rule.match(/^([0-9a-f:.]+)\/(\d+)$/i);
  if (!cidr) return false;
  const base = cidr[1];
  const bits = Number(cidr[2]);
  if (client.includes(':') && base.includes(':')) {
    if (bits === 64) {
      const prefix = base.replace(/::$/, '').replace(/:$/, '');
      return client === prefix || client.startsWith(`${prefix}:`);
    }
  }
  return false;
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

export function isClientIpAllowlisted(request: NextRequest): boolean {
  const allowlist = getSiteIpAllowlist();
  // Fail closed: empty list never means "public".
  if (allowlist.length === 0) return false;

  const ips = getRequestClientIps(request);
  if (ips.length === 0) return false;
  return ips.some((ip) => allowlist.some((allowed) => ipMatchesAllowlistEntry(ip, allowed)));
}

/** Static + maintenance assets that anonymous visitors may load. */
export function isIpGatePublicPath(pathname: string): boolean {
  if (pathname === '/bakim') return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/brand/')) return true;
  if (pathname.startsWith('/images/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  return (
    pathname === '/favicon.ico'
    || pathname === '/icon.svg'
    || pathname === '/icon.png'
    || pathname === '/icon-192.png'
    || pathname === '/icon-512.png'
    || pathname === '/apple-icon.png'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/robots.txt'
  );
}
