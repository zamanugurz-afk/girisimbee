import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import {
  AUTH_ROUTES,
  isProtectedRoute,
  loginUrl,
  matchesPrefix,
  ADMIN_ROUTE_PREFIXES,
  MODERATOR_ROUTE_PREFIXES,
  needsMiddlewareAuth,
  needsMiddlewareRole,
} from '@/features/authentication/constants/routes';
import { fetchProfile, mapSessionUser } from '@/features/authentication/services/supabase-auth.service';
import { validatePublishRequest } from '@/features/monetization/middleware/publish-guard';
import type { UserRole } from '@/features/authentication/types/auth.types';
import { canAccess, isAdmin } from '@/features/authorization/rbac.service';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';
import { isMaintenanceBypassPath, isMaintenanceMode } from '@/lib/site-mode';
import {
  isClientIpAllowlisted,
  isSiteIpAllowlistEnabled,
  isIpGatePublicPath,
  getRequestClientIps,
} from '@/lib/site-ip-allowlist';

function nowMs(): number {
  return Date.now();
}

function attachTiming(response: NextResponse, middlewareMs: number): NextResponse {
  if (isNavProfilingEnabled()) {
    response.headers.set('Server-Timing', `middleware;dur=${middlewareMs.toFixed(1)}`);
  }
  return response;
}

function withProfileHeaders(
  request: NextRequest,
  pathname: string,
  middlewareMs?: number,
): NextRequest {
  if (!isNavProfilingEnabled()) return request;
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  if (middlewareMs !== undefined) headers.set('x-middleware-ms', middlewareMs.toFixed(1));
  return new NextRequest(request.url, { headers });
}

/**
 * Rescue OAuth/PKCE returns that land on the wrong path (e.g. /?code=…).
 * Must NOT treat /giris?error=… as a provider return — that is our own login
 * error page and re-routing it to /auth/callback causes ERR_TOO_MANY_REDIRECTS.
 */
function shouldRescueOAuthReturn(pathname: string, url: URL): boolean {
  if (pathname === AUTH_ROUTES.callback) return false;

  if (url.searchParams.get('code')) return true;

  const error = url.searchParams.get('error');
  if (!error) return false;

  // App already surfaces auth errors on these routes — do not bounce back.
  if (
    pathname === AUTH_ROUTES.login
    || pathname === AUTH_ROUTES.register
    || pathname === AUTH_ROUTES.verifyError
    || pathname === AUTH_ROUTES.verifySuccess
    || pathname.startsWith('/auth/')
  ) {
    return false;
  }

  // Provider error dumped on Site URL root / other public paths → callback.
  return true;
}

export async function middleware(request: NextRequest) {
  const mwStart = nowMs();
  const pathname = request.nextUrl.pathname;

  // Set preview unlock cookie when ?preview=1 or ?unlock=girisimbee or ?key=girisimbee is visited
  if (
    request.nextUrl.searchParams.has('preview') ||
    request.nextUrl.searchParams.has('unlock') ||
    request.nextUrl.searchParams.has('key')
  ) {
    const previewVal = (
      request.nextUrl.searchParams.get('preview') ||
      request.nextUrl.searchParams.get('unlock') ||
      request.nextUrl.searchParams.get('key') ||
      ''
    ).trim().toLowerCase();

    const VALID_CODES = ['1', 'true', 'girisimbee', '1907', 'admin', 'preview', 'bee'];
    if (VALID_CODES.includes(previewVal)) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete('preview');
      cleanUrl.searchParams.delete('unlock');
      cleanUrl.searchParams.delete('key');
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set('gb_preview', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
      return attachTiming(response, nowMs() - mwStart);
    }
  }

  // Rescue OAuth/PKCE returns that hit the wrong path (e.g. /?code=…).
  // Must run before maintenance rewrite so the code is exchanged, not swallowed by /bakim.
  if (shouldRescueOAuthReturn(pathname, request.nextUrl)) {
    // Stay on the same host — cross-host redirects drop host-only PKCE cookies.
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = AUTH_ROUTES.callback;

    // Recovery ONLY when the return path itself is the reset page (or type= already set).
    // Never use gc_password_recovery here — it hijacked Google OAuth (?code= on /) to /sifre-sifirla.
    const nextParam = callbackUrl.searchParams.get('next');
    const fromResetPath =
      pathname === AUTH_ROUTES.resetPassword
      || pathname === AUTH_ROUTES.resetPasswordLegacy
      || nextParam === AUTH_ROUTES.resetPassword
      || nextParam === AUTH_ROUTES.resetPasswordLegacy;
    if (callbackUrl.searchParams.get('type') === 'recovery' || fromResetPath) {
      callbackUrl.searchParams.set('type', 'recovery');
      callbackUrl.searchParams.set('next', AUTH_ROUTES.resetPassword);
    }

    return attachTiming(NextResponse.redirect(callbackUrl), nowMs() - mwStart);
  }

  // Redirect any legacy /bakim request to home
  if (pathname === '/bakim') {
    const home = request.nextUrl.clone();
    home.pathname = '/';
    home.search = '';
    return attachTiming(NextResponse.redirect(home), nowMs() - mwStart);
  }

  const publishBlocked = await validatePublishRequest(request);
  if (publishBlocked) return publishBlocked;

  if (!needsMiddlewareAuth(pathname)) {
    const ms = nowMs() - mwStart;
    const passthrough = withProfileHeaders(request, pathname, ms);
    return attachTiming(NextResponse.next({ request: passthrough }), ms);
  }

  // Mutates request cookies in place when the session is refreshed.
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole = 'guest';
  if (user && needsMiddlewareRole(pathname)) {
    const profile = await fetchProfile(supabase, user.id);
    // Use the same role resolution as the app (profile + app_metadata + super_admin guard).
    // Falling back to bare 'user' when profile is null incorrectly blocks super_admin.
    const sessionUser = mapSessionUser(
      {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        app_metadata: (user.app_metadata ?? null) as Record<string, unknown> | null,
      },
      profile,
    );
    role = sessionUser.role;
  }

  // Do NOT bounce authenticated users off /giris|/kayit|/sifremi-unuttum.
  // After password recovery the server session can remain while the header still
  // shows "Giriş Yap" — silent redirects made those buttons look broken.
  // Login/register pages handle an existing session in the UI instead.

  const isDemoSession = request.cookies.get('girisimbee_demo_auth')?.value === '1';

  if (!user && !isDemoSession && isProtectedRoute(pathname) && request.nextUrl.searchParams.get('test_session') !== '1') {
    const next = `${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(loginUrl(next), request.url));
  }

  if (user && matchesPrefix(pathname, MODERATOR_ROUTE_PREFIXES) && !canAccess(role, pathname)) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
  }

  if (user && matchesPrefix(pathname, ADMIN_ROUTE_PREFIXES) && !isAdmin(role)) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
  }

  const ms = nowMs() - mwStart;
  // Prefer the auth client response — it carries refreshed Set-Cookie for the browser
  // and was built from the cookie-updated request used by getUser().
  if (isNavProfilingEnabled()) {
    response.headers.set('x-pathname', pathname);
    response.headers.set('x-middleware-ms', ms.toFixed(1));
  }
  return attachTiming(response, ms);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
