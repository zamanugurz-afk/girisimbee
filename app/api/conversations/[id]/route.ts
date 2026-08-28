import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { now } from '@/lib/domain/factory';

/**
 * DELETE /api/conversations/[id]
 * Soft deletes the conversation and its messages.
 */
export const DELETE = withAuth(async (ctx, _request, routeContext) => {
  const resolvedParams = await Promise.resolve(routeContext?.params);
  const conversationId = String(resolvedParams?.id || (routeContext as any)?.params?.id || '').trim();

  if (!conversationId) {
    return apiError('Konuşma ID belirtilmedi.', 400, { code: 'BAD_REQUEST' });
  }

  let db: any = null;
  try {
    db = createServiceRoleClient();
  } catch (err) {
    console.warn('[conversations/delete] service role client unavailable, using container:', err);
  }

  const timestamp = now();

  if (db) {
    // 1. Soft delete the conversation
    const { error: cErr } = await db
      .from('marketplace_conversations')
      .update({
        status: 'deleted',
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .eq('id', conversationId);

    if (cErr) {
      console.warn('[conversations/delete] Warning updating conversation:', cErr);
    }

    // 2. Soft delete messages in this conversation
    const { error: mErr } = await db
      .from('marketplace_messages')
      .update({
        status: 'deleted',
        deleted_at: timestamp,
        updated_at: timestamp,
      })
      .eq('conversation_id', conversationId);

    if (mErr) {
      console.warn('[conversations/delete] Warning updating messages:', mErr);
    }

    // 3. Remove participant association so it disappears immediately from active queries
    try {
      await db
        .from('marketplace_conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);
    } catch {}

    return ok({ success: true, message: 'Konuşma başarıyla silindi' });
  }

  // Fallback to container repository
  try {
    await ctx.container.conversationRepository.softDelete(ids.conversation(conversationId));
    return ok({ success: true, message: 'Konuşma başarıyla silindi' });
  } catch (err) {
    return apiError('Konuşma silinemedi', 500, {
      code: 'DELETE_FAILED',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * PATCH /api/conversations/[id]
 * Updates status (archive, restore, block).
 */
export const PATCH = withAuth(async (ctx, request, routeContext) => {
  const resolvedParams = await Promise.resolve(routeContext?.params);
  const conversationId = String(resolvedParams?.id || (routeContext as any)?.params?.id || '').trim();

  if (!conversationId) {
    return apiError('Konuşma ID belirtilmedi.', 400, { code: 'BAD_REQUEST' });
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action || 'archive';

  let db: any = null;
  try {
    db = createServiceRoleClient();
  } catch (err) {
    console.warn('[conversations/patch] service role client unavailable:', err);
  }

  const timestamp = now();
  let nextStatus = 'archived';
  if (action === 'restore' || action === 'unarchive') nextStatus = 'open';
  if (action === 'block') nextStatus = 'blocked';

  if (db) {
    const { data, error } = await db
      .from('marketplace_conversations')
      .update({
        status: nextStatus,
        updated_at: timestamp,
      })
      .eq('id', conversationId)
      .select('*')
      .single();

    if (error) {
      console.error('[conversations/patch] DB error:', error);
      return apiError('Konuşma güncellenemedi', 500, { code: 'UPDATE_FAILED' });
    }

    return ok({ success: true, data, status: nextStatus });
  }

  // Fallback
  try {
    if (nextStatus === 'archived') {
      await ctx.container.messagingService.archive(ids.conversation(conversationId), ctx.userId);
    } else {
      await ctx.container.conversationRepository.update(ids.conversation(conversationId), {
        status: nextStatus as any,
      });
    }
    return ok({ success: true, status: nextStatus });
  } catch (err) {
    return apiError('Konuşma güncellenemedi', 500, {
      code: 'UPDATE_FAILED',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});