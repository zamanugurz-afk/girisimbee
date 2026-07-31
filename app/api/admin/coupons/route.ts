import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, created, noContent } from '@/lib/api/response';
import {
  adminCouponListQuerySchema,
  parseAdminCouponBody,
  adminCouponUpdateSchema,
} from '@/lib/api/validation/admin';

/** GET — list module coupons */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminCouponListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const coupons = await ctx.container.adminServices.coupons.listCoupons(query.moduleKey);
  return ok({ coupons });
});

/** POST — create coupon */
export const POST = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const moduleKey = adminCouponListQuerySchema.parse(Object.fromEntries(url.searchParams)).moduleKey;
  const body = await parseJsonBody(request);
  const input = parseAdminCouponBody(body);
  const coupon = await ctx.container.adminServices.coupons.createCoupon(moduleKey, input);
  return created({ coupon });
});

/** PATCH — update coupon by code query param */
export const PATCH = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminCouponListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const code = url.searchParams.get('code');
  if (!code) throw new Error('code query param required');
  const body = await parseJsonBody(request);
  const input = adminCouponUpdateSchema.parse(body);
  const coupon = await ctx.container.adminServices.coupons.updateCoupon(query.moduleKey, code, input);
  return ok({ coupon });
});

/** DELETE — delete coupon by code query param */
export const DELETE = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminCouponListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const code = url.searchParams.get('code');
  if (!code) throw new Error('code query param required');
  await ctx.container.adminServices.coupons.deleteCoupon(query.moduleKey, code);
  return noContent();
});
