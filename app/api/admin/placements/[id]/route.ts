import { z } from 'zod';
import { withAdmin, assertSuperListingManager } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { ADMIN_PLACEMENT_EXTEND_DAYS } from '@/features/admin/panel/constants/admin-placements.constants';
import { extendExpiresAt } from '@/features/admin/panel/lib/placement-dates';

const bodySchema = z.object({
  action: z.enum(['extend', 'cancel', 'reactivate']),
});

/** PATCH — extend / cancel / reactivate a listing placement (super-admin). */
export const PATCH = withAdmin(async (ctx, request, { params }) => {
  const denied = assertSuperListingManager(ctx);
  if (denied) return denied;

  const body = await parseJsonBody(request);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Geçersiz aksiyon. extend | cancel | reactivate bekleniyor.', 400);
  }

  const placementId = ids.listingPlacement(params.id);
  const repo = ctx.container.listingPlacementRepository;
  const existing = await repo.findById(placementId);
  if (!existing) return apiError('Vitrin kaydı bulunamadı', 404);

  if (parsed.data.action === 'cancel') {
    const updated = await repo.updateStatus(placementId, 'cancelled');
    return ok({ placement: updated });
  }

  if (parsed.data.action === 'extend') {
    const expiresAt = extendExpiresAt(existing.expiresAt, ADMIN_PLACEMENT_EXTEND_DAYS);
    const updated = await repo.updateExpiresAt(placementId, expiresAt, 'active');
    return ok({ placement: updated });
  }

  // reactivate
  const expiresAt =
    new Date(existing.expiresAt).getTime() <= Date.now()
      ? extendExpiresAt(existing.expiresAt, ADMIN_PLACEMENT_EXTEND_DAYS)
      : existing.expiresAt;
  const updated = await repo.updateExpiresAt(placementId, expiresAt, 'active');
  return ok({ placement: updated });
});
