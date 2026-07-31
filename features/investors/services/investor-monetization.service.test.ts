import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEcosystemTestHarness, TEST_USER } from '@/lib/testing/ecosystem-test-fixtures';
import { InvestorMonetizationService } from '@/features/investors/services/investor-monetization.service';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

function mockGateway(): IyzicoGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: 'sess_investor',
      checkoutUrl: 'https://sandbox.iyzipay.com/investor',
      provider: 'iyzico',
      status: 'pending',
    }),
    verifyWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
    refundPayment: vi.fn(),
    resolveProvider: vi.fn(),
  } as unknown as IyzicoGateway;
}

describe('InvestorMonetizationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;
  let monetizationService: InvestorMonetizationService;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
    monetizationService = new InvestorMonetizationService(
      harness.repos.investorPackageRepository,
      harness.repos.paymentRepository,
      undefined,
      mockGateway(),
    );
  });

  it('lists 4 investor packages', async () => {
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
    expect(result.payment.purpose).toBe('investor_package');
    expect(result.payment.amountCents).toBe(19900);
  });

  it('applies coupon discount', async () => {
    const coupon = await monetizationService.applyCoupon('INVESTOR10', 'standard');
    expect(coupon.discountCents).toBe(1990);
    expect(coupon.finalAmountCents).toBe(17910);
  });
});
