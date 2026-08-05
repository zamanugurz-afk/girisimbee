import { z } from 'zod';
import { created, apiError } from '@/lib/api/response';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  asUserId,
  startMarketAdCheckout,
} from '@/features/ads/lib/market-ad-checkout.service';

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional(),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v == null || v === '' ? undefined : v))
    .refine(
      (v) => v == null || /^https?:\/\//i.test(v) || v.startsWith('/'),
      'Geçerli bir URL veya site içi yol girin',
    ),
  linkUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v == null || v === '' ? undefined : v))
    .refine(
      (v) => v == null || /^https?:\/\//i.test(v) || v.startsWith('/'),
      'Geçerli bir URL veya site içi yol girin',
    ),
  ctaLabel: z.string().trim().max(40).optional(),
});

/** Authenticated — pay 5.000 TL and publish MARKET ad. */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError('Form bilgilerini kontrol edin.', 400, {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten(),
    });
  }

  try {
    const origin = new URL(request.url).origin;
    const supabase = createServiceRoleClient();
    const result = await startMarketAdCheckout({
      supabase,
      userId: asUserId(ctx.userId),
      origin,
      input: {
        kind: 'market_ad',
        ...parsed.data,
      },
    });

    return created({ checkout: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ödeme başlatılamadı';
    return apiError(message, 400, { code: 'MARKET_AD_CHECKOUT_FAILED' });
  }
});
