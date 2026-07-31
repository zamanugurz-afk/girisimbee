import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created, apiError } from '@/lib/api/response';
import {
  founderPaymentActionSchema,
  founderPaymentListQuerySchema,
} from '@/lib/api/validation/founder-monetization';
import { ids } from '@/lib/domain/ids';

/** GET — founder payment history */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = founderPaymentListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.founderMonetizationService;

  if (query.userId) {
    const user = await ctx.container.userRepository.findById(ctx.userId);
    if (user?.role !== 'admin') {
      return apiError('Başka kullanıcının ödemelerini görüntüleme yetkiniz yok.', 403, { code: 'FORBIDDEN' });
    }
    const payments = await service.listPaymentHistory({ userId: ids.user(query.userId) });
    return ok({ payments });
  }

  const payments = await service.getPaymentHistory(ctx.userId);
  return ok({ payments });
});

/** POST — checkout, upgrade, downgrade, renew, coupon validation, admin entitlement actions */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = founderPaymentActionSchema.parse(body);
  const service = ctx.container.ecosystem.founderMonetizationService;

  const adminActions = new Set(['activate', 'suspend', 'cancel', 'extend']);
  if (adminActions.has(parsed.action)) {
    const user = await ctx.container.userRepository.findById(ctx.userId);
    if (user?.role !== 'admin') {
      return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
    }
  }

  switch (parsed.action) {
    case 'checkout': {
      const result = await service.createCheckout({
        userId: ctx.userId,
        packageSlug: parsed.packageSlug,
        couponCode: parsed.couponCode,
        successUrl: parsed.successUrl,
        cancelUrl: parsed.cancelUrl,
      });
      return created(result);
    }
    case 'upgrade': {
      const result = await service.upgradePackage(
        ctx.userId,
        parsed.fromSlug,
        parsed.toSlug,
        { successUrl: parsed.successUrl, cancelUrl: parsed.cancelUrl },
      );
      return created(result);
    }
    case 'downgrade': {
      const result = await service.downgradePackage(
        ctx.userId,
        parsed.fromSlug,
        parsed.toSlug,
        { successUrl: parsed.successUrl, cancelUrl: parsed.cancelUrl },
      );
      return created(result);
    }
    case 'renew': {
      const result = await service.renewPackage(
        ctx.userId,
        ids.founderPackage(parsed.userPackageId),
        { successUrl: parsed.successUrl, cancelUrl: parsed.cancelUrl },
      );
      return created(result);
    }
    case 'validate_coupon': {
      const coupon = await service.applyCoupon(parsed.couponCode, parsed.packageSlug);
      return ok({ coupon });
    }
    case 'activate': {
      const entitlement = await service.activatePackage(
        ids.user(parsed.userId),
        parsed.packageSlug,
      );
      return created({ entitlement });
    }
    case 'suspend': {
      const entitlement = await service.suspendPackage(ids.founderPackage(parsed.userPackageId));
      return ok({ entitlement });
    }
    case 'cancel': {
      const entitlement = await service.cancelPackage(ids.founderPackage(parsed.userPackageId));
      return ok({ entitlement });
    }
    case 'extend': {
      const entitlement = await service.extendDuration(
        ids.founderPackage(parsed.userPackageId),
        parsed.extraDays,
      );
      return ok({ entitlement });
    }
  }
});
