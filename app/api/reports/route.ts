import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created, apiError } from '@/lib/api/response';
import { z } from 'zod';

const createReportSchema = z.object({
  entityType: z.enum(['listing', 'user', 'company', 'message', 'profile']).default('listing'),
  entityId: z.string().uuid(),
  reason: z.enum([
    'spam',
    'fraud',
    'harassment',
    'misleading',
    'inappropriate',
    'duplicate',
    'other',
  ]),
  description: z.string().max(2000).optional().nullable(),
});

/** POST — submit a listing/user complaint (authenticated). */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Geçersiz şikayet verisi.', 400, {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten(),
    });
  }

  const report = await ctx.container.reportRepository.create({
    reporterId: ctx.userId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    reason: parsed.data.reason,
    description: parsed.data.description ?? null,
  });

  return created({ report });
});
