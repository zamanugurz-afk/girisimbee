import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { parseAdminApplicationAction } from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

/** PATCH — application review/archive/restore */
export const PATCH = withAdmin(async (ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const action = parseAdminApplicationAction(body);
  const applicationId = ids.application(params.id);
  const service = ctx.container.adminServices.applications;

  switch (action.action) {
    case 'review': {
      const application = await service.reviewApplication(applicationId);
      return ok({ application });
    }
    case 'archive':
      await service.archiveApplication(applicationId);
      return ok({ archived: true });
    case 'restore': {
      const application = await service.restoreApplication(applicationId);
      return ok({ application });
    }
  }
});
