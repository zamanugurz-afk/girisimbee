import { z } from 'zod';
import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';

const bodySchema = z.object({
  action: z.enum(['reject', 'expire']),
});

/**
 * PATCH — admin force-close a pending contact request (reject or expire).
 * Uses service role; bypasses owner-only actor checks for moderation.
 */
export const PATCH = withAdmin(async (_ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Geçersiz aksiyon. reject | expire bekleniyor.', 400);
  }

  const supabase = createServiceRoleClient();
  const id = params.id;
  const now = new Date().toISOString();

  const { data: existing, error: findError } = await supabase
    .from('marketplace_listing_contact_requests')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existing) return apiError('Talep bulunamadı', 404);
  if (existing.status !== 'pending') {
    return apiError('Yalnızca bekleyen talepler kapatılabilir.', 400);
  }

  const patch =
    parsed.data.action === 'reject'
      ? { status: 'rejected', rejected_at: now, responded_at: now }
      : { status: 'expired', responded_at: now, expires_at: now };

  const { data, error } = await supabase
    .from('marketplace_listing_contact_requests')
    .update(patch)
    .eq('id', id)
    .select(
      'id, listing_id, requester_user_id, owner_user_id, status, message, created_at, accepted_at, rejected_at, conversation_id, expires_at',
    )
    .single();

  if (error) throw error;
  return ok({ request: data });
});
