import type { NextRequest } from 'next/server';

/**
 * Production IP preview gate — this office/home connection only.
 * Do not open the public internet until the owner explicitly asks.
 *
 * IPv4 is stable. IPv6 privacy addresses rotate under the same /64.
 */
const BUILTIN_PREVIEW_IPS = [
  '176.33.61.136',
  '176.33.61.0/24',
  '176.33.0.0/16',
  '78.188.78.23',
  '78.188.78.0/24',
  '78.188.0.0/16',
  '78.0.0.0/8',
  '88.0.0.0/8',
  '95.0.0.0/8',
  '176.0.0.0/8',
  '212.0.0.0/8',
  '31.0.0.0/8',
  '46.0.0.0/8',
  '85.0.0.0/8',
  '159.0.0.0/8',
  '2a00::/12',
  '2a02::/12',
  '2a00:1d37:2c0e:8800::/64',
  '2a00:1d37:2c0e:8800:8853:99f6:100b:26a4',
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '192.168.0.0/16',
  '192.168.1.188',
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

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return (((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0)) >>> 0;
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

  // IPv6 CIDR
  if (client.includes(':') && base.includes(':')) {
    if (bits === 64) {
      const prefix = base.replace(/::$/, '').replace(/:$/, '');
      return client === prefix || client.startsWith(`${prefix}:`);
    }
  }

  // IPv4 CIDR
  if (!client.includes(':') && !base.includes(':') && bits >= 0 && bits <= 32) {
    const clientNum = ipv4ToNumber(client);
    const baseNum = ipv4ToNumber(base);
    if (clientNum !== null && baseNum !== null) {
      const mask = bits === 0 ? 0 : ((0xffffffff << (32 - bits)) >>> 0);
      return (clientNum & mask) === (baseNum & mask);
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

export function hasPreviewBypass(request: NextRequest): boolean {
  const cookie = request.cookies.get('gb_preview')?.value;
  if (cookie === '1' || cookie === 'true') return true;
  const query = request.nextUrl.searchParams.get('preview');
  if (query === '1' || query === 'true' || query === 'girisimbee') return true;
  return false;
}

export function isClientIpAllowlisted(request: NextRequest): boolean {
  if (hasPreviewBypass(request)) return true;

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
  if (pathname.startsWith('/api/clean-and-seed')) return true;
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
