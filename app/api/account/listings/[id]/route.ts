import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';
import type { ListingId } from '@/lib/domain/ids';

/**
 * DELETE — Soft delete user's listing (verified by session user_id).
 */
export const DELETE = withAuth(async (ctx, _request, routeContext) => {
  const listingId = routeContext.params.id;
  if (!listingId) {
    return apiError('İlan ID belirtilmedi.', 400, { code: 'BAD_REQUEST' });
  }

  const serverSupabase = (await import('@/lib/supabase/server')).createClient();
  const serviceSupabase = createServiceRoleClient();

  let existing: { id: string; owner_id: string; title: string } | null = null;
  const findRes = await serviceSupabase
    .from('marketplace_listings')
    .select('id, owner_id, title')
    .eq('id', listingId)
    .maybeSingle();

  if (findRes.data) {
    existing = findRes.data as any;
  } else {
    const userFind = await serverSupabase
      .from('marketplace_listings')
      .select('id, owner_id, title')
      .eq('id', listingId)
      .maybeSingle();
    existing = userFind.data as any;
  }

  if (!existing) {
    try {
      const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
      const mem = await getSharedMemoryContainer().listingRepository.findById(listingId as any);
      if (mem) {
        existing = { id: mem.id, owner_id: String(mem.ownerId), title: mem.title };
        await getSharedMemoryContainer().listingRepository.delete(listingId as any);
        return ok({ success: true, id: listingId, title: existing.title });
      }
    } catch {
      // fallback
    }
    return apiError('İlan bulunamadı.', 404, { code: 'NOT_FOUND' });
  }

  if (existing.owner_id && existing.owner_id !== ctx.userId && String(existing.owner_id) !== String(ctx.userId)) {
    return apiError('Bu ilanı silme yetkiniz yok.', 403, { code: 'FORBIDDEN' });
  }

  const updates = {
    status: 'deleted',
    workflow_status: 'deleted',
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let { error: delError } = await serviceSupabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', listingId);

  if (delError) {
    const userUpdate = await serverSupabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', listingId);
    delError = userUpdate.error;
  }

  try {
    const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
    await getSharedMemoryContainer().listingRepository.delete(listingId as any);
  } catch {
    // fallback
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

  const serverSupabase = (await import('@/lib/supabase/server')).createClient();
  const serviceSupabase = createServiceRoleClient();
  const body = (await request.json().catch(() => ({}))) as {
    action?: 'pause' | 'publish' | 'showcase' | 'urgent';
  };

  let existing: { id: string; owner_id: string; status: string; is_featured: boolean; is_urgent: boolean } | null = null;
  const findRes = await serviceSupabase
    .from('marketplace_listings')
    .select('id, owner_id, status, is_featured, is_urgent')
    .eq('id', listingId)
    .maybeSingle();

  if (findRes.data) {
    existing = findRes.data as any;
  } else {
    const userFind = await serverSupabase
      .from('marketplace_listings')
      .select('id, owner_id, status, is_featured, is_urgent')
      .eq('id', listingId)
      .maybeSingle();
    existing = userFind.data as any;
  }

  if (!existing) {
    try {
      const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
      const mem = await getSharedMemoryContainer().listingRepository.findById(listingId as any);
      if (mem) {
        existing = {
          id: mem.id,
          owner_id: String(mem.ownerId),
          status: mem.status,
          is_featured: mem.isFeatured,
          is_urgent: mem.isUrgent,
        };
      }
    } catch {
      // fallback
    }
  }

  if (!existing) {
    return apiError('İlan bulunamadı.', 404, { code: 'NOT_FOUND' });
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
    updates.is_featured = true;
  }

  let updateRes = await serviceSupabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single();

  if (updateRes.error) {
    updateRes = await serverSupabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();
  }

  try {
    const { getSharedMemoryContainer } = require('@/lib/persistence/container') as typeof import('@/lib/persistence/container');
    await getSharedMemoryContainer().listingRepository.update(listingId as any, {
      ...(body.action === 'urgent' ? { isUrgent: true, isFeatured: true } : {}),
      ...(body.action === 'showcase' ? { isFeatured: true } : {}),
      ...(body.action === 'pause' ? { status: 'paused' as any } : {}),
      ...(body.action === 'publish' ? { status: 'published' as any } : {}),
    });
  } catch {
    // fallback
  }

  return ok({ success: true, listing: updateRes.data ?? updates });
});
