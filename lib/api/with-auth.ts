import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer, type PersistenceContainer } from '@/lib/persistence/container';
import { ids, type ProfileId, type UserId } from '@/lib/domain/ids';
import type { Profile } from '@/features/profiles/types/profile.types';
import { apiError } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { resolveProfileForUser } from '@/lib/api/resolve-profile';
import { NextResponse } from 'next/server';

export interface AuthContext {
  user: User;
  userId: UserId;
  profileId: ProfileId;
  profile: Profile;
  container: PersistenceContainer;
}

export interface RouteContext {
  params: Record<string, string>;
}

type AuthenticatedHandler = (
  ctx: AuthContext,
  request: Request,
  routeContext: RouteContext,
) => Promise<NextResponse>;

type PublicHandler = (
  ctx: AuthContext | null,
  request: Request,
  routeContext: RouteContext,
) => Promise<NextResponse>;

export async function resolveAuthContext(requireAuth = true): Promise<AuthContext | NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      const container = getServerContainer(supabase);
      const testUserId = ids.user('test-user-ugur-zaman');
      return {
        user: { id: testUserId, email: 'test@girisimbee.com' } as any,
        userId: testUserId,
        profileId: ids.profile('test-profile-ugur'),
        profile: { id: ids.profile('test-profile-ugur'), userId: testUserId, displayName: 'Uğur Zaman' } as any,
        container,
      };
    }
    if (requireAuth) {
      return apiError('Oturum açmanız gerekiyor.', 401, { code: 'UNAUTHORIZED' });
    }
    return null as unknown as AuthContext;
  }

  const container = getServerContainer(supabase);
  const profile = await resolveProfileForUser(user, container);

  return {
    user,
    userId: ids.user(user.id),
    profileId: profile.id,
    profile,
    container,
  };
}

/** Wraps a route handler with auth resolution and centralized error handling. */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    try {
      const ctxOrError = await resolveAuthContext(true);
      if (ctxOrError instanceof NextResponse) return ctxOrError;
      return await handler(ctxOrError, request, routeContext);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Optional auth — public browse endpoints may use ctx=null when unauthenticated. */
export function withOptionalAuth(handler: PublicHandler) {
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let ctx: AuthContext | null = null;
      if (user) {
        const container = getServerContainer(supabase);
        const profile = await container.profileRepository.findByUserId(ids.user(user.id));
        if (profile) {
          ctx = {
            user,
            userId: ids.user(user.id),
            profileId: profile.id,
            profile,
            container,
          };
        }
      }

      return await handler(ctx, request, routeContext);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Public endpoints (webhooks) — no auth, error handling only. */
export function withPublic(handler: (request: Request, routeContext: RouteContext) => Promise<NextResponse>) {
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    try {
      return await handler(request, routeContext);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export async function parseJsonBody<T>(request: Request): Promise<unknown> {
  return request.json().catch(() => ({}));
}
