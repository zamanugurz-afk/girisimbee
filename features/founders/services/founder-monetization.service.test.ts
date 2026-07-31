import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEcosystemTestHarness, TEST_USER } from '@/lib/testing/ecosystem-test-fixtures';
import { FounderMonetizationService } from '@/features/founders/services/founder-monetization.service';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

function mockGateway(): IyzicoGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: 'sess_founder',
      checkoutUrl: 'https://sandbox.iyzipay.com/founder',
      provider: 'iyzico',
      status: 'pending',
    }),
    verifyWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
    refundPayment: vi.fn(),
    resolveProvider: vi.fn(),
  } as unknown as IyzicoGateway;
}

describe('FounderMonetizationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;
  let monetizationService: FounderMonetizationService;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
    monetizationService = new FounderMonetizationService(
      harness.repos.founderPackageRepository,
      harness.repos.paymentRepository,
      undefined,
      mockGateway(),
    );
  });

  it('lists 4 founder packages', async () => {
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
    expect(result.payment.purpose).toBe('founder_package');
    expect(result.payment.amountCents).toBe(19900);
  });

  it('applies coupon discount', async () => {
    const coupon = await monetizationService.applyCoupon('FOUNDER10', 'standard');
    expect(coupon.discountCents).toBe(1990);
    expect(coupon.finalAmountCents).toBe(17910);
  });
});
