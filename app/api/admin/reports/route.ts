import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminReportQuerySchema } from '@/lib/api/validation/admin';

/** GET — daily/weekly/monthly/custom reports */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminReportQuerySchema.parse(Object.fromEntries(url.searchParams));
  const report = await ctx.container.adminServices.reports.generateReport(
    query.period,
    query.category,
    { from: query.from, to: query.to },
  );
  return ok({ report });
});
