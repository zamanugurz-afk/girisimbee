import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { fulfillMarketAdPayment } from '@/features/ads/lib/market-ad-checkout.service';

async function handleCallback(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  let token = url.searchParams.get('token');
  let inquiryId = url.searchParams.get('inquiryId');

  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') ?? '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        token = (form.get('token') as string | null) ?? token;
        inquiryId = (form.get('inquiryId') as string | null) ?? inquiryId;
      } else {
        const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (json) {
          if (typeof json.token === 'string') token = json.token;
          if (typeof json.inquiryId === 'string') inquiryId = json.inquiryId;
        }
      }
    } catch {
      // keep query params
    }
  }

  if (!token && !inquiryId) {
    return NextResponse.redirect(`${origin}/reklam?error=payment_missing`);
  }

  try {
    const supabase = createServiceRoleClient();
    // Prefer session token; inquiryId helps when token lookup fails.
    let inquirySession = token;
    if (!inquirySession && inquiryId) {
      const { data } = await supabase
        .from('marketplace_ad_inquiries')
        .select('payment_session_id')
        .eq('id', inquiryId)
        .maybeSingle();
      inquirySession = data?.payment_session_id ?? null;
    }

    if (!inquirySession) {
      return NextResponse.redirect(`${origin}/reklam?error=payment_session`);
    }

    const item = await fulfillMarketAdPayment({
      supabase,
      inquiryId: inquiryId ?? undefined,
      sessionId: inquirySession,
      skipProviderVerify: false,
    });

    return NextResponse.redirect(
      `${origin}/reklam/odeme-sonuc?status=ok&itemId=${encodeURIComponent(item.id)}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'payment_failed';
    return NextResponse.redirect(
      `${origin}/reklam/odeme-sonuc?status=error&message=${encodeURIComponent(message)}`,
    );
  }
}

export async function GET(request: Request) {
  return handleCallback(request);
}

export async function POST(request: Request) {
  return handleCallback(request);
}
