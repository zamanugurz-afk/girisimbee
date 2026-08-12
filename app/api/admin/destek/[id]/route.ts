import { z } from 'zod';
import { ok, noContent, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  deleteSupportInquiry,
  getSupportInquiry,
  updateSupportInquiry,
} from '@/features/support-inbox/lib/support-inquiry.repository';
import { listSupportInquiryThreadMessages } from '@/features/support-inbox/lib/support-reply.service';
import { SUPPORT_INQUIRY_STATUSES } from '@/features/support-inbox/types/support-inquiry.types';

const patchSchema = z.object({
  status: z.enum(SUPPORT_INQUIRY_STATUSES).optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
});

export const GET = withAdmin(async (_ctx, _request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  const supabase = createServiceRoleClient();
  const item = await getSupportInquiry(supabase, id);
  if (!item) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  const thread = await listSupportInquiryThreadMessages(supabase, id);
  return ok({
    item,
    conversationId: thread.conversationId,
    messages: thread.messages,
  });
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
    const existing = await getSupportInquiry(supabase, id);
    if (!existing) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

    const item = await updateSupportInquiry(
      supabase,
      id,
      parsed.data,
      ctx.adminUserId,
    );
    return ok({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Güncellenemedi';
    return apiError(message, 500, { code: 'SUPPORT_INQUIRY_UPDATE_FAILED' });
  }
});

export const DELETE = withAdmin(async (_ctx, _request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  try {
    const supabase = createServiceRoleClient();
    const existing = await getSupportInquiry(supabase, id);
    if (!existing) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

    await deleteSupportInquiry(supabase, id);
    return noContent();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Silinemedi';
    return apiError(message, 500, { code: 'SUPPORT_INQUIRY_DELETE_FAILED' });
  }
});
