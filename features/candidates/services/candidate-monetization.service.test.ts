import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_PROFILE,
} from '@/lib/testing/ecosystem-test-fixtures';
import { CandidateMonetizationService } from '@/features/candidates/services/candidate-monetization.service';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

function mockGateway(): IyzicoGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: 'sess_candidate',
      checkoutUrl: 'https://sandbox.iyzipay.com/candidate',
      provider: 'iyzico',
      status: 'pending',
    }),
    verifyWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
    refundPayment: vi.fn(),
    resolveProvider: vi.fn(),
  } as unknown as IyzicoGateway;
}

describe('CandidateMonetizationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;
  let monetizationService: CandidateMonetizationService;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
    monetizationService = new CandidateMonetizationService(
      harness.repos.candidatePackageRepository,
      harness.repos.paymentRepository,
      undefined,
      mockGateway(),
    );
  });

  it('lists 4 candidate packages', async () => {
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
    expect(result.payment.purpose).toBe('candidate_package');
    expect(result.payment.amountCents).toBe(19900);
  });

  it('applies coupon discount', async () => {
    const coupon = await monetizationService.applyCoupon('CANDIDATE10', 'standard');
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
});
