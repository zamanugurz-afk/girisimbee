import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { FranchiseMonetizationService } from '@/features/franchise/services/franchise-monetization.service';
import { MockFranchisePackageRepository } from '@/features/franchise/repository/mock/franchise-package.repository.mock';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

describe('FranchiseMonetizationService', () => {
  let service: FranchiseMonetizationService;
  let packageRepo: MockFranchisePackageRepository;
  let paymentRepo: MockPaymentRepository;
  let gateway: IyzicoGateway;

  const userId = ids.user('u0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    packageRepo = new MockFranchisePackageRepository();
    paymentRepo = new MockPaymentRepository();
    gateway = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        sessionId: 'sess_franchise_123',
        checkoutUrl: 'https://sandbox.iyzipay.com/checkout/franchise',
        provider: 'iyzico',
        status: 'pending',
      }),
      verifyWebhook: vi.fn(),
      getPaymentStatus: vi.fn(),
      refundPayment: vi.fn(),
      resolveProvider: vi.fn(),
    } as unknown as IyzicoGateway;

    service = new FranchiseMonetizationService(packageRepo, paymentRepo, undefined, gateway);
  });

  it('lists four franchise catalog packages', async () => {
    const catalog = await service.listCatalog();
    expect(catalog).toHaveLength(4);
    expect(catalog.map((p) => p.slug)).toEqual(['standard', 'professional', 'featured', 'urgent']);
  });

  it('creates iyzico checkout for standard package', async () => {
    const result = await service.createCheckout({
      userId,
      packageSlug: 'standard',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.checkout.url).toContain('iyzipay');
    expect(result.payment.purpose).toBe('franchise_package');
    expect(result.payment.amountCents).toBe(29900);
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 29900, purpose: 'franchise_package' }),
    );
  });

  it('applies coupon discount', async () => {
    const coupon = await service.applyCoupon('FRANCHISE10', 'standard');
    expect(coupon.discountCents).toBe(2990);
    expect(coupon.finalAmountCents).toBe(26910);
  });

  it('creates checkout with coupon metadata', async () => {
    const result = await service.createCheckout({
      userId,
      packageSlug: 'standard',
      couponCode: 'FRANCHISE10',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.payment.amountCents).toBe(26910);
    expect(result.payment.metadata.couponCode).toBe('FRANCHISE10');
  });

  it('records payment history', async () => {
    await service.createCheckout({
      userId,
      packageSlug: 'professional',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    const history = await service.getPaymentHistory(userId);
    expect(history).toHaveLength(1);
    expect(history[0]?.purpose).toBe('franchise_package');
  });

  it('admin activates package entitlement', async () => {
    const entitlement = await service.activatePackage(userId, 'featured');
    expect(entitlement.packageSlug).toBe('featured');
    expect(entitlement.status).toBe('active');
    expect(entitlement.grantedBy).toBe('admin');
  });

  it('computes remaining days', async () => {
    const entitlement = await service.activatePackage(userId, 'urgent');
    const days = await service.getRemainingDays(entitlement.id);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(14);
  });

  it('expires entitlement past expiresAt', async () => {
    const entitlement = await service.activatePackage(userId, 'standard');
    await packageRepo.extendDuration(entitlement.id, -31);
    const checked = await service.checkExpiration(entitlement.id);
    expect(checked.status).toBe('expired');
  });

  it('fulfills payment and grants entitlement', async () => {
    const { payment } = await service.createCheckout({
      userId,
      packageSlug: 'standard',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    await paymentRepo.transitionStatus(payment.id, 'succeeded');
    const entitlement = await service.fulfillPayment(payment.id);
    expect(entitlement?.packageSlug).toBe('standard');
    expect(entitlement?.grantedBy).toBe('payment');
  });

  it('stores invoice metadata on payment update', async () => {
    const { payment } = await service.createCheckout({
      userId,
      packageSlug: 'standard',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    const updated = await service.updatePayment(payment.id, {
      metadata: { invoiceRef: 'INV-2026-001', invoiceUrl: 'https://example.com/invoice/001' },
    });

    const invoice = await service.getInvoice(payment.id);
    expect(updated.metadata.invoiceRef).toBe('INV-2026-001');
    expect(invoice.invoice.invoiceUrl).toBe('https://example.com/invoice/001');
  });

  it('suspends and cancels entitlements', async () => {
    const entitlement = await service.activatePackage(userId, 'professional');
    const suspended = await service.suspendPackage(entitlement.id);
    expect(suspended.status).toBe('suspended');

    const cancelled = await service.cancelPackage(entitlement.id);
    expect(cancelled.status).toBe('cancelled');
  });

  it('extends entitlement duration', async () => {
    const entitlement = await service.activatePackage(userId, 'standard');
    const before = await service.getRemainingDays(entitlement.id);
    const extended = await service.extendDuration(entitlement.id, 15);
    const after = await service.getRemainingDays(extended.id);
    expect(after).toBeGreaterThan(before);
  });
});
