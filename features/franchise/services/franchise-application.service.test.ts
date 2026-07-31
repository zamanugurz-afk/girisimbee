import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_USER_2,
  TEST_PROFILE,
  TEST_PROFILE_2,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';

describe('FranchiseApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE, userId: TEST_USER, displayName: 'Franchisor' }),
    );
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE_2, userId: TEST_USER_2, displayName: 'Buyer' }),
    );
  });

  async function publishGiveListing() {
    const { franchiseService } = harness.services;
    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    return franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: {
        title: 'Kafe Franchise',
        shortDescription: '50 şube franchise fırsatı sunuyoruz',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactPhone: '+905551234567',
        contactEmail: 'fr@example.com',
      },
    });
  }

  it('submits application with pending status and history', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();

    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');
    const application = await franchiseApplicationService.submitApplication(
      TEST_PROFILE_2,
      listing.id,
      'Merhaba, ilgileniyorum',
    );

    expect(application.status).toBe('pending');
    expect(application.coverMessage).toBe('Merhaba, ilgileniyorum');
    expect(application.submittedAt).toBeTruthy();
  });

  it('prevents duplicate applications', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');

    await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    await expect(
      franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id),
    ).rejects.toThrow('Bu ilana zaten başvuru yapılmış');
  });

  it('lists and filters applications for franchisor', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');

    const app = await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    await franchiseApplicationService.markReviewing(app.id, TEST_PROFILE);

    const reviewing = await franchiseApplicationService.listApplicationsForListing(
      listing.id,
      TEST_PROFILE,
      { status: 'reviewing' },
    );
    expect(reviewing).toHaveLength(1);
    expect(reviewing[0].status).toBe('reviewing');
    expect(reviewing[0].reviewedAt).toBeTruthy();

    const pending = await franchiseApplicationService.listApplicationsForListing(
      listing.id,
      TEST_PROFILE,
      { status: 'pending' },
    );
    expect(pending).toHaveLength(0);
  });

  it('transitions status approve/reject and records notes', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');

    const app = await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    await franchiseApplicationService.markReviewing(app.id, TEST_PROFILE);

    const approved = await franchiseApplicationService.updateApplicationStatus(
      app.id,
      TEST_PROFILE,
      'approved',
      'Güçlü aday',
    );
    expect(approved.status).toBe('approved');

    const detail = await franchiseApplicationService.getApplicationDetail(app.id, TEST_PROFILE);
    expect(detail.notes.some((n) => n.text === 'Güçlü aday')).toBe(true);
    expect(detail.history.some((h) => h.status === 'approved')).toBe(true);
  });

  it('returns external contact for applicant without unlock gate', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');

    const app = await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    const result = await franchiseApplicationService.contactApplicant(app.id, TEST_PROFILE_2);

    expect(result.contact.phone).toBe('+905551234567');
    expect(result.contact.email).toBe('fr@example.com');
    expect(result.application.status).toBe('contacted');
  });

  it('returns applicant contact for franchisor', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');
    await franchiseService.upsertBuyProfile(TEST_PROFILE_2, {
      telefon: '+905559999999',
      eposta: 'buyer@example.com',
    });

    const app = await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    const result = await franchiseApplicationService.contactApplicant(app.id, TEST_PROFILE);

    expect(result.contact.phone).toBe('+905559999999');
    expect(result.contact.email).toBe('buyer@example.com');
  });

  it('buyer can list own applications and withdraw', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');

    const app = await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);
    const mine = await franchiseApplicationService.listApplicationsForApplicant(TEST_PROFILE_2);
    expect(mine).toHaveLength(1);

    const withdrawn = await franchiseApplicationService.withdrawApplication(app.id, TEST_PROFILE_2);
    expect(withdrawn.status).toBe('withdrawn');
  });

  it('favorites franchise listing', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();

    const favorite = await franchiseApplicationService.favoriteListing(TEST_USER_2, listing.id);
    expect(favorite.listingId).toBe(listing.id);

    await franchiseApplicationService.unfavoriteListing(TEST_USER_2, listing.id);
    const again = await harness.repos.favoriteRepository.findByUserAndListing(TEST_USER_2, listing.id);
    expect(again).toBeNull();
  });

  it('increments listing view count on detail view', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    const before = listing.viewCount ?? 0;

    await franchiseApplicationService.incrementListingViews(listing.id);
    const updated = await harness.repos.listingRepository.findById(listing.id);
    expect(updated?.viewCount).toBe(before + 1);
  });

  it('rejects non-manager viewing listing applications', async () => {
    const { franchiseService, franchiseApplicationService } = harness.services;
    const listing = await publishGiveListing();
    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');
    await franchiseApplicationService.submitApplication(TEST_PROFILE_2, listing.id);

    await expect(
      franchiseApplicationService.listApplicationsForListing(listing.id, TEST_PROFILE_2),
    ).rejects.toThrow('Bu ilanın başvurularını görüntüleme yetkiniz yok');
  });
});
