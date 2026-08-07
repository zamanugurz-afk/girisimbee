import { z } from 'zod';
import { ok, apiError } from '@/lib/api/response';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { listAdInquiries } from '@/features/ads/lib/ad-inquiry.repository';
import {
  AD_INQUIRY_KINDS,
  AD_INQUIRY_STATUSES,
} from '@/features/ads/types/ad-inquiry.types';

const querySchema = z.object({
  status: z.enum(AD_INQUIRY_STATUSES).optional(),
  kind: z.enum(AD_INQUIRY_KINDS).optional(),
});

export const GET = withAdmin(async (_ctx, request) => {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get('status') || undefined,
    kind: url.searchParams.get('kind') || undefined,
  });
  if (!parsed.success) {
    return apiError('Geçersiz filtre.', 400, { code: 'VALIDATION_ERROR' });
  }

  try {
    const supabase = createServiceRoleClient();
    const items = await listAdInquiries(supabase, parsed.data);
    return ok({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Talepler yüklenemedi';
    return apiError(message, 500, { code: 'AD_INQUIRY_LIST_FAILED' });
  }
});
