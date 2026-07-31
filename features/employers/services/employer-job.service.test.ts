import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { createCandidateProfile } from '@/features/profiles/factories/module-profile.factory';
import { EmployerJobService } from '@/features/employers/services/employer-job.service';
import { EmployerService } from '@/features/employers/services/employer.service';
import { EmployerApplicationService } from '@/features/employers/services/employer-application.service';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { PaymentService as IyzicoGateway } from '@/lib/payments/services/payment-service';

function mockGateway(): IyzicoGateway {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      sessionId: 'sess_unlock',
      checkoutUrl: 'https://sandbox.iyzipay.com/unlock',
      provider: 'iyzico',
      status: 'pending',
    }),
    verifyWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
    refundPayment: vi.fn(),
    resolveProvider: vi.fn(),
  } as unknown as IyzicoGateway;
}

describe('EmployerJobService (facade)', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;
  let employerJobService: EmployerJobService;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    const employerService = new EmployerService(
      harness.repos.moduleProfileRepository,
      harness.repos.listingRepository,
    );
    const employerApplicationService = new EmployerApplicationService(
      harness.repos.applicationRepository,
      harness.repos.listingRepository,
      harness.repos.moduleProfileRepository,
      harness.repos.profileRepository,
      harness.services.applicationService,
      new MarketplacePaymentService(
        harness.repos.paymentRepository,
        harness.repos.applicationRepository,
        harness.repos.listingPackageRepository,
        undefined,
        mockGateway(),
      ),
    );
    employerJobService = new EmployerJobService(employerService, employerApplicationService);

    await harness.repos.profileRepository.create(
      createProfile({ userId: TEST_USER, displayName: 'Employer', id: TEST_PROFILE }),
    );
    await harness.repos.moduleProfileRepository.upsertCandidateProfile(
      createCandidateProfile({ profileId: TEST_PROFILE_2 }),
    );
  });

  it('publishes anonymous job listing via facade', async () => {
    await employerJobService.activateProfile(TEST_PROFILE);

    const listing = await employerJobService.publishJob({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: { title: 'Senior Dev', shortDescription: 'Full-time position available', city: 'Ankara' },
    });

    expect(listing.anonymousMode).toBe(true);
    expect(listing.moduleKey).toBe('employers');
  });

  it('creates unlock checkout via iyzico', async () => {
    const { applicationService } = harness.services;

    const listing = await employerJobService.publishJob({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: { title: 'Dev Role', shortDescription: 'Remote developer position', city: 'Ankara' },
    });

    const app = await applicationService.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: TEST_PROFILE_2,
    });

    const result = await employerJobService.purchaseUnlock({
      userId: TEST_USER,
      applicationId: app.id,
      managerProfileId: TEST_PROFILE,
      amountCents: 9900,
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.checkout.url).toContain('iyzipay');
    expect(result.payment.purpose).toBe('unlock_candidate');
  });
});
