import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, created, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { withMarketAdmin } from '@/features/admin/market/lib/with-market-admin';
import {
  createMarketItem,
  listMarketItems,
} from '@/features/admin/market/lib/market-repository';
import { MARKET_ITEM_STATUSES } from '@/features/admin/market/types/market.types';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => {
    if (v == null || v === '') return null;
    return v;
  })
  .refine(
    (v) => v == null || /^https?:\/\//i.test(v) || v.startsWith('/'),
    'Geçerli bir URL veya site içi yol girin',
  );

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(''),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  ctaLabel: z.string().trim().max(40).optional().default('İncele'),
  sortOrder: z.number().int().min(0).max(100).optional().default(0),
  status: z.enum(MARKET_ITEM_STATUSES).optional().default('draft'),
});

export const GET = withMarketAdmin(async () => {
  const supabase = createClient();
  const items = await listMarketItems(supabase);
  return ok({ items });
});

export const POST = withMarketAdmin(
  async (ctx, request) => {
    const body = await parseJsonBody(request);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Geçersiz MARKET kartı verisi.', 400, {
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }

    try {
      const supabase = createClient();
      const item = await createMarketItem(supabase, parsed.data, ctx.adminUserId);
      return created({ item });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kart oluşturulamadı.';
      return apiError(message, 400, { code: 'MARKET_CREATE_FAILED' });
    }
  },
  { write: true },
);
