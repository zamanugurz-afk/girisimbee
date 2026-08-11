import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { PASSWORD_RECOVERY_COOKIE } from '@/features/authentication/lib/password-recovery-cookie';
import { OAUTH_NEXT_COOKIE } from '@/features/authentication/lib/oauth-next';
import { resolveAuthCookieDomain } from '@/lib/supabase/cookie-options';

function clearCookie(res: NextResponse, name: string, hostname: string) {
  const domain = resolveAuthCookieDomain(hostname);
  res.cookies.set(name, '', { path: '/', maxAge: 0 });
  if (domain) {
    res.cookies.set(name, '', { path: '/', maxAge: 0, domain });
  }
  // Legacy host-only cookies on sibling domains.
  for (const d of ['.girisimbee.com', '.girisimbee.tr', '.girisimbee.com.tr']) {
    res.cookies.set(name, '', { path: '/', maxAge: 0, domain: d });
  }
}

function clearAuthCookies(res: NextResponse, request: Request) {
  const hostname = new URL(request.url).hostname;
  const names = new Set<string>([
    PASSWORD_RECOVERY_COOKIE,
    OAUTH_NEXT_COOKIE,
  ]);

  // Wipe every Supabase auth chunk cookie the browser sent.
  const cookieHeader = request.headers.get('cookie') ?? '';
  for (const part of cookieHeader.split(';')) {
    const name = part.trim().split('=')[0];
    if (!name) continue;
    if (
      name.startsWith('sb-')
      || name.includes('auth-token')
      || name === PASSWORD_RECOVERY_COOKIE
      || name === OAUTH_NEXT_COOKIE
    ) {
      names.add(name);
    }
  }

  for (const name of names) {
    clearCookie(res, name, hostname);
  }
  return res;
}

function loginRedirect(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  const target =
    next && next.startsWith('/')
      ? new URL(next, request.url)
      : new URL(AUTH_ROUTES.login, request.url);
  return clearAuthCookies(NextResponse.redirect(target), request);
}

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return loginRedirect(request);
}

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return loginRedirect(request);
}
