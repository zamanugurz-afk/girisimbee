import type { DeviceType } from '@/features/listings/types/listing-view.types';

/** Best-effort client IP from common proxy headers. */
export function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  return cf || null;
}

export function extractDeviceType(request: Request): DeviceType {
  const ua = (request.headers.get('user-agent') ?? '').toLowerCase();
  if (!ua) return 'unknown';
  if (/ipad|tablet/.test(ua)) return 'tablet';
  if (/mobi|iphone|android/.test(ua)) return 'mobile';
  return 'desktop';
}
