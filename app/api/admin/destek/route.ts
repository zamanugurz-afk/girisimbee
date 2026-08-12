import { z } from 'zod';
import { ok, apiError } from '@/lib/api/response';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { listSupportInquiries } from '@/features/support-inbox/lib/support-inquiry.repository';
import {
  SUPPORT_INQUIRY_CHANNELS,
  SUPPORT_INQUIRY_STATUSES,
} from '@/features/support-inbox/types/support-inquiry.types';

const querySchema = z.object({
  status: z.enum(SUPPORT_INQUIRY_STATUSES).optional(),
  channel: z.enum(SUPPORT_INQUIRY_CHANNELS).optional(),
});

export const GET = withAdmin(async (_ctx, request) => {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get('status') || undefined,
    channel: url.searchParams.get('channel') || undefined,
  });
  if (!parsed.success) {
    return apiError('Geçersiz filtre.', 400, { code: 'VALIDATION_ERROR' });
  }

  try {
    const supabase = createServiceRoleClient();
    const items = await listSupportInquiries(supabase, parsed.data);
    return ok({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Talepler yüklenemedi';
    return apiError(message, 500, { code: 'SUPPORT_INQUIRY_LIST_FAILED' });
  }
});
