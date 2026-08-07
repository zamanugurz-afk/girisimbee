import { z } from 'zod';
import { ok, noContent, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  deleteAdInquiry,
  getAdInquiry,
  updateAdInquiry,
} from '@/features/ads/lib/ad-inquiry.repository';
import { AD_INQUIRY_STATUSES } from '@/features/ads/types/ad-inquiry.types';

const patchSchema = z.object({
  status: z.enum(AD_INQUIRY_STATUSES).optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
});

export const GET = withAdmin(async (_ctx, _request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  const supabase = createServiceRoleClient();
  const item = await getAdInquiry(supabase, id);
  if (!item) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });
  return ok({ item });
});

export const PATCH = withAdmin(async (ctx, request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  const body = await parseJsonBody(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Geçersiz güncelleme.', 400, {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten(),
    });
  }

  try {
    const supabase = createServiceRoleClient();
    const existing = await getAdInquiry(supabase, id);
    if (!existing) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

    const item = await updateAdInquiry(
      supabase,
      id,
      parsed.data,
      ctx.adminUserId,
    );
    return ok({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Güncellenemedi';
    return apiError(message, 500, { code: 'AD_INQUIRY_UPDATE_FAILED' });
  }
});

export const DELETE = withAdmin(async (_ctx, _request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  try {
    const supabase = createServiceRoleClient();
    const existing = await getAdInquiry(supabase, id);
    if (!existing) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

    await deleteAdInquiry(supabase, id);
    return noContent();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Silinemedi';
    return apiError(message, 500, { code: 'AD_INQUIRY_DELETE_FAILED' });
  }
});
