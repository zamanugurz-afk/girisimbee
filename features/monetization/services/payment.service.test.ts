import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

describe('MarketplacePaymentService', () => {
  let service: MarketplacePaymentService;
  let paymentRepo: MockPaymentRepository;
  let applicationRepo: MockApplicationRepository;
  let packageRepo: MockListingPackageRepository;
  let gateway: IyzicoGateway;

  const userId = ids.user('u0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    paymentRepo = new MockPaymentRepository();
    applicationRepo = new MockApplicationRepository();
    packageRepo = new MockListingPackageRepository();
    gateway = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        sessionId: 'sess_test_123',
        checkoutUrl: 'https://sandbox.iyzipay.com/checkout',
        provider: 'iyzico',
        status: 'pending',
      }),
      verifyWebhook: vi.fn(),
      getPaymentStatus: vi.fn(),
      refundPayment: vi.fn(),
      resolveProvider: vi.fn(),
    } as unknown as IyzicoGateway;

    service = new MarketplacePaymentService(
      paymentRepo,
      applicationRepo,
      packageRepo,
      undefined,
      gateway,
    );
  });

  it('creates checkout session with catalog price via iyzico', async () => {
    const session = await service.createCheckoutSession({
      userId,
      packageSlug: 'single_listing',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(session.url).toContain('iyzipay');
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 9900, purpose: 'package_purchase' }),
    );
  });

  it('records payment directly', async () => {
    const payment = await service.recordPayment({
      userId,
      amountCents: 5000,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: 'app-1',
    });

    expect(payment.provider).toBe('iyzico');
    expect(payment.amountCents).toBe(5000);
  });
});
