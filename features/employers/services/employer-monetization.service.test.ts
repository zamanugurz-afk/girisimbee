import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEcosystemTestHarness, TEST_USER } from '@/lib/testing/ecosystem-test-fixtures';
import { EmployerMonetizationService } from '@/features/employers/services/employer-monetization.service';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

function mockGateway(): IyzicoGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: 'sess_employer',
      checkoutUrl: 'https://sandbox.iyzipay.com/employer',
      provider: 'iyzico',
      status: 'pending',
    }),
    verifyWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
    refundPayment: vi.fn(),
    resolveProvider: vi.fn(),
  } as unknown as IyzicoGateway;
}

describe('EmployerMonetizationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;
  let monetizationService: EmployerMonetizationService;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
    monetizationService = new EmployerMonetizationService(
      harness.repos.employerPackageRepository,
      harness.repos.paymentRepository,
      undefined,
      mockGateway(),
    );
  });

  it('lists 4 employer packages', async () => {
    const catalog = await monetizationService.listCatalog();
    expect(catalog).toHaveLength(4);
    expect(catalog.map((p) => p.slug)).toEqual(['standard', 'professional', 'featured', 'urgent']);
  });

  it('creates checkout for standard package', async () => {
    const result = await monetizationService.createCheckout({
      userId: TEST_USER,
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.checkout.url).toContain('iyzipay');
    expect(result.payment.purpose).toBe('employer_package');
    expect(result.payment.amountCents).toBe(19900);
  });

  it('applies coupon discount', async () => {
    const coupon = await monetizationService.applyCoupon('EMPLOYER10', 'standard');
    expect(coupon.discountCents).toBe(1990);
    expect(coupon.finalAmountCents).toBe(17910);
  });

  it('fulfills payment and grants entitlement', async () => {
    const checkout = await monetizationService.createCheckout({
      userId: TEST_USER,
      packageSlug: 'professional',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });

    await monetizationService.updatePayment(checkout.payment.id, { status: 'succeeded' });
    const entitlement = await monetizationService.fulfillPayment(checkout.payment.id);

    expect(entitlement?.packageSlug).toBe('professional');
    expect(entitlement?.status).toBe('active');
  });

  it('tracks payment history', async () => {
    await monetizationService.createCheckout({
      userId: TEST_USER,
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });

    const history = await monetizationService.getPaymentHistory(TEST_USER);
    expect(history).toHaveLength(1);
    expect(history[0]?.purpose).toBe('employer_package');
  });
});
