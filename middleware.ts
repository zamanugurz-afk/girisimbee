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

function nowMs(): number {
  return Date.now();
}

function attachTiming(response: NextResponse, middlewareMs: number): NextResponse {
  if (!isNavProfilingEnabled()) return response;
  response.headers.set('Server-Timing', `middleware;dur=${middlewareMs.toFixed(1)}`);
  return response;
}

function forwardHeaders(request: NextRequest, pathname: string, middlewareMs?: number): Headers {
  const headers = new Headers(request.headers);
  if (isNavProfilingEnabled()) {
    headers.set('x-pathname', pathname);
    if (middlewareMs !== undefined) headers.set('x-middleware-ms', middlewareMs.toFixed(1));
  }
  return headers;
}

export async function middleware(request: NextRequest) {
  const mwStart = nowMs();
  const pathname = request.nextUrl.pathname;

  const publishBlocked = await validatePublishRequest(request);
  if (publishBlocked) return publishBlocked;

  if (!needsMiddlewareAuth(pathname)) {
    const ms = nowMs() - mwStart;
    return attachTiming(
      NextResponse.next({ request: { headers: forwardHeaders(request, pathname, ms) } }),
      ms,
    );
  }

  const headers = forwardHeaders(request, pathname);
  const profiledRequest = new NextRequest(request.url, { headers });

  const { supabase, response } = createClient(profiledRequest);
  const { data: { user } } = await supabase.auth.getUser();

  let role: UserRole = 'guest';
  if (user && needsMiddlewareRole(pathname)) {
    const profile = await fetchProfile(supabase, user.id);
    role = profile ? normalizeAppRole(profile.role) : 'user';
  }

  if (user && isGuestOnlyRoute(pathname)) {
    const next = request.nextUrl.searchParams.get('next') ?? AUTH_ROUTES.dashboard;
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
  const reqHeaders = forwardHeaders(request, pathname, ms);
  const out = NextResponse.next({ request: { headers: reqHeaders } });
  response.cookies.getAll().forEach((cookie) => out.cookies.set(cookie));
  return attachTiming(out, ms);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
