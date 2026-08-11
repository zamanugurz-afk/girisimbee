import { withAdmin, assertSuperListingManager } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  adminPaymentListQuerySchema,
  parseAdminPaymentAction,
} from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

/** GET — payment history */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminPaymentListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminServices.payments.listPayments(
    {
      userId: query.userId ? ids.user(query.userId) : undefined,
      status: query.status,
      purpose: query.purpose as never,
    },
    { page: query.page, limit: query.limit },
  );
  return ok(result);
});

/** POST — refund / package entitlement actions */
export const POST = withAdmin(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const action = parseAdminPaymentAction(body);
  const service = ctx.container.adminServices.payments;

  switch (action.action) {
    case 'refund': {
      const payment = await service.refundPayment(ids.payment(action.paymentId));
      return ok({ payment });
    }
    case 'activate_package': {
      const denied = assertSuperListingManager(ctx);
      if (denied) return denied;
      const entitlement = await service.activateModulePackage(
        action.moduleKey,
        ids.user(action.userId),
        action.packageSlug,
      );
      return created({ entitlement });
    }
    case 'suspend_package': {
      const entitlement = await service.suspendModulePackage(action.moduleKey, action.userPackageId);
      return ok({ entitlement });
    }
  }
});
