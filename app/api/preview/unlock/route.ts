import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const VALID_CODES = new Set(['girisimbee', '1907', 'preview', 'admin', 'bee', '1']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').trim().toLowerCase();

    if (VALID_CODES.has(code)) {
      const response = NextResponse.json({ success: true, message: 'Önizleme kilidi açıldı' });
      response.cookies.set('gb_preview', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Geçersiz erişim kodu' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'İşlem başarısız oldu' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const code = (
    request.nextUrl.searchParams.get('code') ||
    request.nextUrl.searchParams.get('key') ||
    request.nextUrl.searchParams.get('preview') ||
    ''
  ).trim().toLowerCase();

  const redirectTo = request.nextUrl.searchParams.get('next') || '/';

  if (VALID_CODES.has(code)) {
    const target = new URL(redirectTo, request.url);
    const response = NextResponse.redirect(target);
    response.cookies.set('gb_preview', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    });
    return response;
  }

  return NextResponse.redirect(new URL('/bakim', request.url));
}
