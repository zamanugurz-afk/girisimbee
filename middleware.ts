import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import {
  AUTH_ROUTES,
  isGuestOnlyRoute,
  isProtectedRoute,
  loginUrl,
  matchesPrefix,
  ADMIN_ROUTE_PREFIXES,
  MODERATOR_ROUTE_PREFIXES,
  needsMiddlewareAuth,
  needsMiddlewareRole,
} from '@/features/authentication/constants/routes';
import { fetchProfile } from '@/features/authentication/services/supabase-auth.service';
import { validatePublishRequest } from '@/features/monetization/middleware/publish-guard';
import type { UserRole } from '@/features/authentication/types/auth.types';
import { canAccess, isAdmin } from '@/features/authorization/rbac.service';
import { normalizeAppRole } from '@/features/authorization/roles';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';
import { isMaintenanceBypassPath, isMaintenanceMode } from '@/lib/site-mode';

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

function isOAuthReturnQuery(url: URL): boolean {
  // Supabase PKCE / OAuth returns land with ?code=… (or provider error).
  // Site URL misconfig often drops these on `/` instead of `/auth/callback`.
  return Boolean(url.searchParams.get('code') || url.searchParams.get('error'));
}

export async function middleware(request: NextRequest) {
  const mwStart = nowMs();
  const pathname = request.nextUrl.pathname;

  // Rescue OAuth/PKCE returns that hit the wrong path (e.g. /?code=…).
  // Must run before maintenance rewrite so the code is exchanged, not swallowed by /bakim.
  if (pathname !== AUTH_ROUTES.callback && isOAuthReturnQuery(request.nextUrl)) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = AUTH_ROUTES.callback;
    return attachTiming(NextResponse.redirect(callbackUrl), nowMs() - mwStart);
  }

  // Public gate — rewrite to maintenance page without destroying routes.
  if (isMaintenanceMode() && !isMaintenanceBypassPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/bakim';
    const rewritten = NextResponse.rewrite(url);
    return attachTiming(rewritten, nowMs() - mwStart);
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
    role = profile ? normalizeAppRole(profile.role) : 'user';
  }

  if (user && isGuestOnlyRoute(pathname)) {
    const next = request.nextUrl.searchParams.get('next') ?? AUTH_ROUTES.home;
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!user && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL(loginUrl(pathname), request.url));
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
