import { NextResponse, type NextRequest } from 'next/server';
import { getRequestClientIps, isClientIpAllowlisted, isSiteIpAllowlistEnabled } from '@/lib/site-ip-allowlist';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ips = getRequestClientIps(request);
  const allowlisted = isClientIpAllowlisted(request);
  const enabled = isSiteIpAllowlistEnabled();
  const previewCookie = request.cookies.get('gb_preview')?.value;

  return NextResponse.json({
    ips,
    isAllowlisted: allowlisted,
    isAllowlistEnabled: enabled,
    hasPreviewCookie: previewCookie === '1' || previewCookie === 'true',
    headers: {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for'),
    },
  });
}
