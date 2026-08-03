import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, noContent, apiError } from '@/lib/api/response';
import { parseJsonBody } from '@/lib/api/with-auth';
import { withMarketAdmin } from '@/features/admin/market/lib/with-market-admin';
import {
  getMarketItem,
  softDeleteMarketItem,
  updateMarketItem,
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

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  ctaLabel: z.string().trim().max(40).optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  status: z.enum(MARKET_ITEM_STATUSES).optional(),
});

type RouteCtx = { params: { id: string } };

export const GET = withMarketAdmin(async (_ctx, _request, routeContext) => {
  const { id } = (routeContext as RouteCtx).params;
  const supabase = createClient();
  const item = await getMarketItem(supabase, id);
  if (!item) return apiError('MARKET kartı bulunamadı.', 404, { code: 'NOT_FOUND' });
  return ok({ item });
});

export const PATCH = withMarketAdmin(
  async (_ctx, request, routeContext) => {
    const { id } = (routeContext as RouteCtx).params;
    const body = await parseJsonBody(request);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Geçersiz MARKET kartı verisi.', 400, {
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }

    try {
      const supabase = createClient();
      const item = await updateMarketItem(supabase, id, parsed.data);
      return ok({ item });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kart güncellenemedi.';
      return apiError(message, 400, { code: 'MARKET_UPDATE_FAILED' });
    }
  },
  { write: true },
);

export const DELETE = withMarketAdmin(
  async (_ctx, _request, routeContext) => {
    const { id } = (routeContext as RouteCtx).params;
    try {
      const supabase = createClient();
      await softDeleteMarketItem(supabase, id);
      return noContent();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kart silinemedi.';
      return apiError(message, 400, { code: 'MARKET_DELETE_FAILED' });
    }
  },
  { write: true },
);
