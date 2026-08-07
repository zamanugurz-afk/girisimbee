import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { created, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { createAdInquiry } from '@/features/ads/lib/ad-inquiry.repository';
import { PARTNERSHIP_TYPES } from '@/features/ads/types/ad-inquiry.types';
import { sendAdInquiryConfirmation } from '@/lib/email/send';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v == null || v === '' ? undefined : v))
  .refine(
    (v) => v == null || /^https?:\/\//i.test(v) || v.startsWith('/'),
    'Geçerli bir URL veya site içi yol girin',
  );

const contactBase = {
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
};

const marketAdSchema = z.object({
  kind: z.literal('market_ad'),
  ...contactBase,
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional(),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  ctaLabel: z.string().trim().max(40).optional(),
});

const partnershipSchema = z.object({
  kind: z.literal('partnership'),
  ...contactBase,
  partnershipType: z.enum(PARTNERSHIP_TYPES),
  message: z.string().trim().min(20).max(2000),
});

const schema = z.discriminatedUnion('kind', [marketAdSchema, partnershipSchema]);

/** Public — create MARKET ad or partnership inquiry. */
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
    const inquiry = await createAdInquiry(admin, parsed.data, createdBy);
    void sendAdInquiryConfirmation({
      to: parsed.data.email,
      fullName: parsed.data.fullName,
      kind: parsed.data.kind,
      inquiryId: inquiry.id,
    }).catch(() => undefined);
    return created({ inquiry: { id: inquiry.id, kind: inquiry.kind, status: inquiry.status } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Talep gönderilemedi';
    const missingTable =
      /marketplace_ad_inquiries|schema cache|does not exist/i.test(message);
    return apiError(
      missingTable
        ? 'Reklam talepleri tablosu henüz kurulmadı. Supabase migration’ını uygulayın.'
        : message,
      500,
      { code: 'AD_INQUIRY_CREATE_FAILED' },
    );
  }
}
