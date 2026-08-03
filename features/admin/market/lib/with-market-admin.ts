import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ids, type UserId } from '@/lib/domain/ids';
import { apiError } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { resolveAuthContext, type AuthContext, type RouteContext } from '@/lib/api/with-auth';
import {
  canManageMarket,
  canViewMarketAdmin,
} from '@/features/admin/market/lib/market-permissions';
import { isAdmin } from '@/features/authorization/rbac.service';

export interface MarketAdminContext extends AuthContext {
  adminUserId: UserId;
  rawRole: string | null;
  canWrite: boolean;
}

async function loadRawRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  return data?.role ? String(data.role) : null;
}

async function resolveMarketAdmin(
  ctx: AuthContext,
  requireWrite: boolean,
): Promise<MarketAdminContext | NextResponse> {
  const domainUser = await ctx.container.userRepository.findById(ctx.userId);
  const rawRole = await loadRawRole(ctx.userId);
  const role = domainUser?.role ?? null;

  if (!canViewMarketAdmin(role, rawRole) && !isAdmin(role)) {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  const canWrite = canManageMarket(role, rawRole);
  if (requireWrite && !canWrite) {
    return apiError('Moderator yalnızca görüntüleme yetkisine sahiptir.', 403, {
      code: 'FORBIDDEN_READ_ONLY',
    });
  }

  return {
    ...ctx,
    adminUserId: ids.user(ctx.userId) as UserId,
    rawRole,
    canWrite,
  };
}

type MarketHandler = (
  ctx: MarketAdminContext,
  request: Request,
  routeContext: RouteContext,
) => Promise<NextResponse>;

/** Admin panel access: admin, super_admin, moderator (read). */
export function withMarketAdmin(handler: MarketHandler, options?: { write?: boolean }) {
  const requireWrite = Boolean(options?.write);
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    try {
      const ctxOrError = await resolveAuthContext(true);
      if (ctxOrError instanceof NextResponse) return ctxOrError;

      const marketCtx = await resolveMarketAdmin(ctxOrError, requireWrite);
      if (marketCtx instanceof NextResponse) return marketCtx;

      return await handler(marketCtx, request, routeContext);
    } catch (err) {
      return handleApiError(err);
    }
  };
}
