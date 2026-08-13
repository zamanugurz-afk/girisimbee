import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { CANDIDATE_UNLOCK_PRICE_CENTS } from '@/features/monetization/config/candidate-unlock';
import { ForbiddenError } from '@/lib/domain/errors';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

describe('MarketplacePaymentService', () => {
  let service: MarketplacePaymentService;
  let paymentRepo: MockPaymentRepository;
  let applicationRepo: MockApplicationRepository;
  let packageRepo: MockListingPackageRepository;
  let listingRepo: MockListingRepository;
  let gateway: IyzicoGateway;

  const userId = ids.user('u0000001-0001-4000-8000-000000000001');
  const otherUserId = ids.user('u0000001-0001-4000-8000-000000000099');

  beforeEach(() => {
    paymentRepo = new MockPaymentRepository();
    applicationRepo = new MockApplicationRepository();
    packageRepo = new MockListingPackageRepository();
    listingRepo = new MockListingRepository();
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
      listingRepo,
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

  it('rejects unlock checkout when actor does not own the listing', async () => {
    const listing = await listingRepo.create({
      ownerId: otherUserId,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Other owner job',
      shortDescription: 'desc',
      moduleKey: 'employers',
    });
    const application = await applicationRepo.create({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: ids.profile('p0000001-0001-4000-8000-000000000001'),
    });

    await expect(
      service.createUnlockCheckout({
        userId,
        applicationId: application.id,
        amountCents: 1,
        successUrl: 'https://example.com/ok',
        cancelUrl: 'https://example.com/cancel',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('uses server unlock price and ignores client amountCents', async () => {
    const listing = await listingRepo.create({
      ownerId: userId,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Owned job',
      shortDescription: 'desc',
      moduleKey: 'employers',
    });
    const application = await applicationRepo.create({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: ids.profile('p0000001-0001-4000-8000-000000000001'),
    });

    const result = await service.createUnlockCheckout({
      userId,
      applicationId: application.id,
      amountCents: 1,
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.payment.amountCents).toBe(CANDIDATE_UNLOCK_PRICE_CENTS);
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: CANDIDATE_UNLOCK_PRICE_CENTS }),
    );
  });
});
