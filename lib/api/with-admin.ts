import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer, type PersistenceContainer } from '@/lib/persistence/container';
import { ids, type ProfileId, type UserId } from '@/lib/domain/ids';
import type { Profile } from '@/features/profiles/types/profile.types';
import { apiError } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { resolveAuthContext, type AuthContext, type RouteContext } from '@/lib/api/with-auth';

export interface AdminContext extends AuthContext {
  adminUser: User;
  adminUserId: UserId;
}

type AdminHandler = (
  ctx: AdminContext,
  request: Request,
  routeContext: RouteContext,
) => Promise<NextResponse>;

async function assertAdmin(ctx: AuthContext): Promise<AdminContext | NextResponse> {
  const domainUser = await ctx.container.userRepository.findById(ctx.userId);
  if (!domainUser || (domainUser.role !== 'admin' && domainUser.role !== 'super_admin')) {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  return {
    ...ctx,
    adminUser: ctx.user,
    adminUserId: ctx.userId,
  };
}

/** Wraps a route handler with auth + admin role guard. */
export function withAdmin(handler: AdminHandler) {
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    try {
      const ctxOrError = await resolveAuthContext(true);
      if (ctxOrError instanceof NextResponse) return ctxOrError;

      const adminCtx = await assertAdmin(ctxOrError);
      if (adminCtx instanceof NextResponse) return adminCtx;

      return await handler(adminCtx, request, routeContext);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Resolve admin context for server actions — throws/returns error response. */
export async function resolveAdminContext(): Promise<AdminContext | NextResponse> {
  const ctxOrError = await resolveAuthContext(true);
  if (ctxOrError instanceof NextResponse) return ctxOrError;
  return assertAdmin(ctxOrError);
}

export async function requireAdminFromContainer(
  container: PersistenceContainer,
  profile: Profile,
  user: User,
): Promise<AdminContext | null> {
  const domainUser = await container.userRepository.findById(ids.user(user.id));
  if (!domainUser || (domainUser.role !== 'admin' && domainUser.role !== 'super_admin')) return null;
  return {
    user,
    userId: ids.user(user.id),
    profileId: profile.id as ProfileId,
    profile,
    container,
    adminUser: user,
    adminUserId: ids.user(user.id),
  };
}
