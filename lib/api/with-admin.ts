import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { getServerContainer, type PersistenceContainer } from '@/lib/persistence/container';
import { ids, type ProfileId, type UserId } from '@/lib/domain/ids';
import type { Profile } from '@/features/profiles/types/profile.types';
import { apiError } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { resolveAuthContext, type AuthContext, type RouteContext } from '@/lib/api/with-auth';
import { isAdmin, isSuperAdmin } from '@/features/authorization/rbac.service';
import { fetchSessionUser } from '@/features/authentication/services/supabase-auth.service';
import type { AppRole } from '@/features/authorization/role.constants';
import { normalizeAppRole } from '@/features/authorization/roles';

export interface AdminContext extends AuthContext {
  adminUser: User;
  adminUserId: UserId;
  /** Resolved session role (admin | super_admin). */
  adminRole: AppRole;
}

type AdminHandler = (
  ctx: AdminContext,
  request: Request,
  routeContext: RouteContext,
) => Promise<NextResponse>;

async function assertAdmin(ctx: AuthContext): Promise<AdminContext | NextResponse> {
  // Prefer live session role (profiles + app_metadata) so super_admin is recognized.
  const sessionUser = await fetchSessionUser(createClient());
  let roleRaw = sessionUser?.role ?? null;

  let allowed = isAdmin(roleRaw);
  if (!allowed) {
    const domainUser = await ctx.container.userRepository.findById(ctx.userId);
    allowed = Boolean(domainUser && isAdmin(domainUser.role));
    if (domainUser?.role) roleRaw = domainUser.role;
  }

  if (!allowed) {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  // Admin mutations use service role so RLS is_admin() gaps (e.g. super_admin) cannot block writes.
  let container: PersistenceContainer = ctx.container;
  try {
    container = getServerContainer(createServiceRoleClient());
  } catch {
    container = ctx.container;
  }

  const adminRole = normalizeAppRole(roleRaw ?? 'admin');

  return {
    ...ctx,
    container,
    adminUser: ctx.user,
    adminUserId: ctx.userId,
    adminRole,
  };
}

/** Super-admin-only boost / extend actions (ücretsiz doping, süre uzatma). */
export function assertSuperListingManager(ctx: AdminContext): NextResponse | null {
  if (isSuperAdmin(ctx.adminRole)) return null;
  return apiError(
    'Bu işlem yalnızca süper yönetici (ilan yöneticisi) tarafından yapılabilir.',
    403,
    { code: 'SUPER_ADMIN_REQUIRED' },
  );
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
  if (!domainUser || !isAdmin(domainUser.role)) return null;
  return {
    user,
    userId: ids.user(user.id),
    profileId: profile.id as ProfileId,
    profile,
    container,
    adminUser: user,
    adminUserId: ids.user(user.id),
    adminRole: normalizeAppRole(domainUser.role),
  };
}
