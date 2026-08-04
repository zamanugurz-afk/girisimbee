import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
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
