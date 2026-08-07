import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { z } from 'zod';
import { ids } from '@/lib/domain/ids';
import { paginationSchema } from '@/lib/domain/validation';

const listQuerySchema = paginationSchema.extend({
  status: z
    .enum(['submitted', 'in_review', 'resolved', 'dismissed', 'deleted'])
    .optional(),
  entityType: z.enum(['listing', 'user', 'company', 'message', 'profile']).optional(),
  query: z.string().max(200).optional(),
});

const actionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('resolve'),
    resolution: z.string().min(1).max(2000),
  }),
  z.object({ action: z.literal('dismiss') }),
  z.object({ action: z.literal('review') }),
]);

/** GET — live moderation queue from marketplace_reports */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = listQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminService.listReports(
    {
      status: query.status,
      entityType: query.entityType,
    },
    { page: query.page, limit: query.limit },
  );

  let data = result.data;
  if (query.query?.trim()) {
    const q = query.query.trim().toLowerCase();
    data = data.filter(
      (r) =>
        r.id.toLowerCase().includes(q)
        || r.entityId.toLowerCase().includes(q)
        || r.reason.toLowerCase().includes(q)
        || (r.description ?? '').toLowerCase().includes(q),
    );
  }

  return ok({
    ...result,
    data,
    total: query.query?.trim() ? data.length : result.total,
    totalPages: query.query?.trim()
      ? Math.max(1, Math.ceil(data.length / (result.limit || 20)))
      : Math.max(1, Math.ceil(result.total / (result.limit || 20))),
  });
});

/** PATCH — resolve / dismiss / mark reviewing */
export const PATCH = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return apiError('Şikayet id gerekli.', 400, { code: 'MISSING_ID' });
  }

  const body = await parseJsonBody(request);
  const action = actionSchema.parse(body);
  const reportId = ids.report(id);
  const adminId = ctx.adminUserId;

  if (action.action === 'resolve') {
    const report = await ctx.container.adminService.resolveReport(
      reportId,
      adminId,
      action.resolution,
    );
    return ok({ report });
  }

  if (action.action === 'dismiss') {
    const report = await ctx.container.adminService.dismissReport(reportId, adminId);
    return ok({ report });
  }

  await ctx.container.reportRepository.transitionStatus(reportId, 'in_review');
  const report = await ctx.container.reportRepository.update(reportId, {
    reviewerId: adminId,
    reviewedAt: new Date().toISOString(),
  });
  return ok({ report });
});
