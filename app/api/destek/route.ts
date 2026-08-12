import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { created, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { createSupportInquiry } from '@/features/support-inbox/lib/support-inquiry.repository';
import {
  SUPPORT_INQUIRY_CHANNELS,
  SUPPORT_INQUIRY_SUBJECTS,
} from '@/features/support-inbox/types/support-inquiry.types';
import { sendTransactionalEmail } from '@/lib/email/send';
import { CONTACT_EMAILS } from '@/features/shared/constants/contact';

const schema = z.object({
  channel: z.enum(SUPPORT_INQUIRY_CHANNELS).optional().default('support'),
  subject: z.enum(SUPPORT_INQUIRY_SUBJECTS),
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(20).max(4000),
});

/** Public — create Destek / Bilgi inquiry. */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return apiError('Form bilgilerini kontrol edin.', 400, {
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }

    let createdBy: string | null = null;
    try {
      const session = createClient();
      const { data } = await session.auth.getUser();
      createdBy = data.user?.id ?? null;
    } catch {
      createdBy = null;
    }

    const admin = createServiceRoleClient();
    const inquiry = await createSupportInquiry(admin, parsed.data, createdBy);

    void sendTransactionalEmail({
      to: parsed.data.email,
      subject: 'Destek talebiniz alındı — Girisimbee',
      text:
        `Merhaba ${parsed.data.fullName},\n\n`
        + `Destek talebiniz alındı. Ekibimiz en kısa sürede ${CONTACT_EMAILS.support} üzerinden dönüş yapacak.\n\n`
        + `Talep no: ${inquiry.id}\n\nGirisimbee`,
      html:
        `<p>Merhaba ${parsed.data.fullName},</p>`
        + `<p>Destek talebiniz alındı. Ekibimiz en kısa sürede dönüş yapacak.</p>`
        + `<p style="color:#64748b;font-size:13px">Talep no: ${inquiry.id}</p>`
        + `<p>Girisimbee</p>`,
    }).catch(() => undefined);

    return created({ inquiry: { id: inquiry.id, status: inquiry.status } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Talep gönderilemedi';
    const missingTable =
      /marketplace_support_inquiries|schema cache|does not exist/i.test(message);
    return apiError(
      missingTable
        ? 'Destek talepleri tablosu henüz kurulmadı. Supabase migration’ını uygulayın.'
        : message,
      500,
      { code: 'SUPPORT_INQUIRY_CREATE_FAILED' },
    );
  }
}
