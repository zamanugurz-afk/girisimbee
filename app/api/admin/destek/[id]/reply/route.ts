import { z } from 'zod';
import { ok, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { sendSupportInquiryReply } from '@/features/support-inbox/lib/support-reply.service';
import { SUPPORT_INQUIRY_STATUSES } from '@/features/support-inbox/types/support-inquiry.types';
import type { UserId } from '@/lib/domain/ids';

const replySchema = z.object({
  body: z.string().trim().min(1).max(5000),
  markStatus: z.enum(SUPPORT_INQUIRY_STATUSES).optional(),
});

/** POST — send in-app message to user (Mesajlarım) about this support inquiry. */
export const POST = withAdmin(async (ctx, request, routeContext) => {
  const id = routeContext.params?.id;
  if (!id) return apiError('Talep bulunamadı.', 404, { code: 'NOT_FOUND' });

  const body = await parseJsonBody(request);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Geçersiz mesaj.', 400, {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten(),
    });
  }

  try {
    const supabase = createServiceRoleClient();
    const result = await sendSupportInquiryReply({
      supabase,
      inquiryId: id,
      adminUserId: ctx.adminUserId as UserId,
      body: parsed.data.body,
      markStatus: parsed.data.markStatus,
    });
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mesaj gönderilemedi';
    const isClient =
      /eşleşmiyor|bulunamadı|kendi talebinize|karakter/i.test(message);
    return apiError(message, isClient ? 400 : 500, {
      code: isClient ? 'SUPPORT_REPLY_REJECTED' : 'SUPPORT_REPLY_FAILED',
    });
  }
});
