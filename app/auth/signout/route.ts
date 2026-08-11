import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { PASSWORD_RECOVERY_COOKIE } from '@/features/authentication/lib/password-recovery-cookie';
import { OAUTH_NEXT_COOKIE } from '@/features/authentication/lib/oauth-next';

function clearFlowCookies(res: NextResponse) {
  for (const name of [PASSWORD_RECOVERY_COOKIE, OAUTH_NEXT_COOKIE]) {
    res.cookies.set(name, '', { path: '/', maxAge: 0, domain: '.girisimbee.com' });
    res.cookies.set(name, '', { path: '/', maxAge: 0 });
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
  return clearFlowCookies(NextResponse.redirect(target));
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
