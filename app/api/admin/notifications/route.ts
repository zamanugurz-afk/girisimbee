import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError, created } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { ids } from '@/lib/domain/ids';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const sendSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(2000),
  type: z.literal('system').optional(),
});

/**
 * GET — recent inbox notifications across users.
 * Verifies the live notifications pipeline for the admin Bildirimler tab.
 */
export const GET = withAdmin(async (_ctx, request) => {
  const url = new URL(request.url);
  const { limit } = querySchema.parse(Object.fromEntries(url.searchParams));
  const sb = createServiceRoleClient();

  const primary = await sb
    .from('notifications')
    .select('id, user_id, title, description, type, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!primary.error) {
    const notifications = (primary.data ?? []).map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      title: String(row.title ?? ''),
      description: row.description ? String(row.description) : null,
      type: String(row.type ?? 'system'),
      isRead: Boolean(row.is_read),
      createdAt: String(row.created_at),
    }));
    return ok({ notifications, source: 'notifications' });
  }

  const fallback = await sb
    .from('marketplace_notifications')
    .select('id, user_id, title, body, type, status, read_at, created_at, deleted_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (fallback.error) {
    return ok({ notifications: [], source: 'none', warning: fallback.error.message });
  }

  const notifications = (fallback.data ?? []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title ?? ''),
    description: row.body ? String(row.body) : null,
    type: String(row.type ?? 'system'),
    isRead: Boolean(row.read_at),
    createdAt: String(row.created_at),
  }));

  return ok({ notifications, source: 'marketplace_notifications' });
});

/** POST — send a single in-app system notification to a user. */
export const POST = withAdmin(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('userId, title ve body zorunlu.', 400);
  }

  const sb = createServiceRoleClient();
  const now = new Date().toISOString();
  const payload = {
    user_id: parsed.data.userId,
    title: parsed.data.title,
    description: parsed.data.body,
    type: parsed.data.type ?? 'system',
    is_read: false,
    created_at: now,
  };

  // Prefer the same primary table the GET endpoint reads.
  const primary = await sb.from('notifications').insert(payload).select('id').maybeSingle();
  if (!primary.error && primary.data?.id) {
    return created({
      notification: {
        id: String(primary.data.id),
        userId: parsed.data.userId,
        title: parsed.data.title,
        body: parsed.data.body,
      },
      source: 'notifications',
    });
  }

  // Fallback domain service → marketplace_notifications
  const notification = await ctx.container.notificationService.send({
    userId: ids.user(parsed.data.userId),
    type: parsed.data.type ?? 'system',
    title: parsed.data.title,
    body: parsed.data.body,
    actionUrl: null,
    entityType: null,
    entityId: null,
    metadata: { source: 'admin_notifications', sentBy: String(ctx.adminUserId) },
  });

  return created({ notification, source: 'marketplace_notifications' });
});
