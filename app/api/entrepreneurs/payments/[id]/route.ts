import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { entrepreneurPaymentPatchSchema } from '@/lib/api/validation/entrepreneur-monetization';
import { ids } from '@/lib/domain/ids';
import { isAdmin } from '@/features/authorization/rbac.service';

/** PATCH — attach invoice metadata, update status, fulfill entitlement after payment */
export const PATCH = withAuth(async (ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const parsed = entrepreneurPaymentPatchSchema.parse(body);
  const paymentId = ids.payment(params.id);
  const service = ctx.container.ecosystem.entrepreneurMonetizationService;

  const existing = await ctx.container.paymentRepository.findById(paymentId);
  if (!existing) {
    return apiError('Ödeme bulunamadı.', 404, { code: 'NOT_FOUND' });
  }

  const isOwner = existing.userId === ctx.userId;
  const user = await ctx.container.userRepository.findById(ctx.userId);
  const admin = isAdmin(user?.role);

  if (!isOwner && !admin) {
    return apiError('Bu ödemeyi güncelleme yetkiniz yok.', 403, { code: 'FORBIDDEN' });
  }

  if (parsed.status && !admin) {
    return apiError('Ödeme durumu yalnızca yönetici tarafından güncellenebilir.', 403, { code: 'FORBIDDEN' });
  }

  if (parsed.fulfill && !admin) {
    return apiError('Paket aktivasyonu yalnızca yönetici tarafından yapılabilir.', 403, { code: 'FORBIDDEN' });
  }

  const metadata = {
    ...(parsed.invoiceRef ? { invoiceRef: parsed.invoiceRef } : {}),
    ...(parsed.invoiceUrl ? { invoiceUrl: parsed.invoiceUrl } : {}),
  };

  const payment = await service.updatePayment(paymentId, {
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  });

  let entitlement = null;
  if (parsed.fulfill || (parsed.status === 'succeeded' && existing.status !== 'succeeded')) {
    entitlement = await service.fulfillPayment(paymentId);
  }

  const invoice = await service.getInvoice(paymentId);
  return ok({ payment, invoice: invoice.invoice, entitlement });
});
