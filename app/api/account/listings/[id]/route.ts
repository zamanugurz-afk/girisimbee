import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { createClient } from '@/lib/supabase/server';
import type { ListingId } from '@/lib/domain/ids';

/**
 * DELETE — Soft delete user's listing (verified by session user_id).
 */
export const DELETE = withAuth(async (ctx, _request, routeContext) => {
  const listingId = routeContext.params.id;
  if (!listingId) {
    return apiError('İlan ID belirtilmedi.', 400, { code: 'BAD_REQUEST' });
  }

  const supabase = createClient();

  const { data: existing, error: findError } = await supabase
    .from('marketplace_listings')
    .select('id, owner_id, title')
    .eq('id', listingId)
    .maybeSingle();

  if (findError || !existing) {
    return apiError('İlan bulunamadı.', 404, { code: 'NOT_FOUND' });
  }

  if (existing.owner_id !== ctx.userId) {
    return apiError('Bu ilanı silme yetkiniz yok.', 403, { code: 'FORBIDDEN' });
  }

  const { error: delError } = await supabase
    .from('marketplace_listings')
    .update({
      status: 'deleted',
      workflow_status: 'deleted',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  if (delError) {
    return apiError(delError.message, 500, { code: 'DELETE_FAILED' });
  }

  return ok({ success: true, id: listingId, title: existing.title });
});

/**
 * PATCH — Update status (pause/publish) or boost (showcase/urgent) on user's listing.
 */
export const PATCH = withAuth(async (ctx, request, routeContext) => {
  const listingId = routeContext.params.id;
  if (!listingId) {
    return apiError('İlan ID belirtilmedi.', 400, { code: 'BAD_REQUEST' });
  }

  const supabase = createClient();
  const body = (await request.json().catch(() => ({}))) as {
    action?: 'pause' | 'publish' | 'showcase' | 'urgent';
  };

  const { data: existing, error: findError } = await supabase
    .from('marketplace_listings')
    .select('id, owner_id, status, is_featured, is_urgent')
    .eq('id', listingId)
    .maybeSingle();

  if (findError || !existing) {
    return apiError('İlan bulunamadı.', 404, { code: 'NOT_FOUND' });
  }

  if (existing.owner_id !== ctx.userId) {
    return apiError('Bu ilanı güncelleme yetkiniz yok.', 403, { code: 'FORBIDDEN' });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.action === 'pause') {
    updates.status = 'paused';
    updates.workflow_status = 'paused';
  } else if (body.action === 'publish') {
    updates.status = 'published';
    updates.workflow_status = 'published';
  } else if (body.action === 'showcase') {
    updates.is_featured = true;
  } else if (body.action === 'urgent') {
    updates.is_urgent = true;
  }

  const { data, error: updateError } = await supabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single();

  if (updateError) {
    return apiError(updateError.message, 500, { code: 'UPDATE_FAILED' });
  }

  return ok({ success: true, listing: data });
});
