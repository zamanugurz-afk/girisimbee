import { describe, it, expect, beforeEach } from 'vitest';
import { AdminDashboardService } from '@/features/admin/services/admin-dashboard.service';
import { AdminService } from '@/features/admin/services/admin.service';
import { AdminApplicationsService } from '@/features/admin/services/admin-applications.service';
import { AdminCouponsService } from '@/features/admin/services/admin-coupons.service';
import { MockUserRepository } from '@/features/authentication/repository/mock/user.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { MockCompanyRepository } from '@/features/companies/repository/mock/company.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockMessageRepository } from '@/features/messaging/repository/mock/message.repository.mock';
import { MockReportRepository } from '@/features/shared/repository/mock/report.repository.mock';
import { MockVerificationRepository } from '@/features/authentication/repository/mock/verification.repository.mock';
import { MockActivityRepository } from '@/features/shared/repository/mock/activity.repository.mock';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { MockMarketplaceSettingsRepository } from '@/features/monetization/repository/mock/marketplace-settings.repository.mock';
import { MockFranchisePackageRepository } from '@/features/franchise/repository/mock/franchise-package.repository.mock';
import { MockEmployerPackageRepository } from '@/features/employers/repository/mock/employer-package.repository.mock';
import { MockCandidatePackageRepository } from '@/features/candidates/repository/mock/candidate-package.repository.mock';
import { MockEntrepreneurPackageRepository } from '@/features/entrepreneurs/repository/mock/entrepreneur-package.repository.mock';
import { MockInvestorPackageRepository } from '@/features/investors/repository/mock/investor-package.repository.mock';
import { MockFounderPackageRepository } from '@/features/founders/repository/mock/founder-package.repository.mock';
import { ListingPackageService } from '@/features/monetization/services/listing-package.service';
import { VerificationService } from '@/features/authentication/services/verification.service';
import { ids } from '@/lib/domain/ids';
import { createPayment } from '@/features/monetization/factories/payment.factory';

describe('AdminDashboardService', () => {
  let dashboard: AdminDashboardService;
  let userRepo: MockUserRepository;
  let paymentRepo: MockPaymentRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    paymentRepo = new MockPaymentRepository();
    dashboard = new AdminDashboardService(
      userRepo,
      new MockCompanyRepository(),
      new MockListingRepository(),
      new MockMessageRepository(),
      new MockApplicationRepository(),
      paymentRepo,
      new MockActivityRepository(),
    );
  });

  it('calculates revenue and conversion rate from repositories', async () => {
    const payment = createPayment({
      userId: ids.user('u0000001-0001-4000-8000-000000000001'),
      amountCents: 5000,
      purpose: 'franchise_package',
      entityType: 'franchise_package',
      entityId: 'standard',
      status: 'succeeded',
    });
    await paymentRepo.create({ ...payment, provider: 'iyzico' });

    const stats = await dashboard.getStats();
    expect(stats.revenueCents).toBeGreaterThanOrEqual(5000);
    expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
    expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
  });
});

describe('AdminService user and listing actions', () => {
  let admin: AdminService;
  let userRepo: MockUserRepository;
  let listingRepo: MockListingRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    listingRepo = new MockListingRepository();
    const settingsRepo = new MockMarketplaceSettingsRepository();
    const packageRepo = new MockListingPackageRepository();
    const packageService = new ListingPackageService(settingsRepo, packageRepo);
    const verificationService = new VerificationService(
      new MockVerificationRepository(),
      new MockProfileRepository(),
      new MockCompanyRepository(),
    );

    admin = new AdminService(
      userRepo,
      new MockProfileRepository(),
      new MockCompanyRepository(),
      listingRepo,
      new MockMessageRepository(),
      new MockReportRepository(),
      new MockVerificationRepository(),
      packageService,
      verificationService,
      new MockApplicationRepository(),
      new MockPaymentRepository(),
      new MockActivityRepository(),
    );
  });

  it('deactivates an active user', async () => {
    const user = await userRepo.create({
      email: 'admin-test@example.com',
      passwordHash: 'x'.repeat(60),
    });
    await userRepo.transitionStatus(user.id, 'active');
    const deactivated = await admin.deactivateUser(user.id);
    expect(deactivated.status).toBe('deactivated');
  });

  it('features and unfeatures a listing', async () => {
    const ownerId = ids.user('u0000001-0001-4000-8000-000000000002');
    const listing = await listingRepo.create({
      ownerId,
      categoryId: ids.category('c0000001-0001-4000-8000-000000000001'),
      listingTypeId: ids.listingType('t0000001-0001-4000-8000-000000000001'),
      title: 'Admin Feature Test Listing',
      shortDescription: 'Short description for admin feature test listing.',
    });

    const featured = await admin.featureListing(listing.id);
    expect(featured.isFeatured).toBe(true);
    expect(featured.featuredUntil).not.toBeNull();

    const unfeatured = await admin.unfeatureListing(listing.id);
    expect(unfeatured.isFeatured).toBe(false);
  });
});

describe('AdminApplicationsService', () => {
  it('transitions application to reviewing', async () => {
    const appRepo = new MockApplicationRepository();
    const service = new AdminApplicationsService(appRepo);
    const application = await appRepo.create({
      moduleKey: 'franchise',
      listingId: ids.listing('l0000001-0001-4000-8000-000000000001'),
      applicantProfileId: ids.profile('p0000001-0001-4000-8000-000000000001'),
    });

    const reviewed = await service.reviewApplication(application.id);
    expect(reviewed.status).toBe('reviewing');
  });
});

describe('AdminCouponsService', () => {
  it('lists and creates franchise coupons', async () => {
    const franchiseRepo = new MockFranchisePackageRepository();
    const service = AdminCouponsService.fromPackageRepos({
      franchisePackageRepository: franchiseRepo,
      employerPackageRepository: new MockEmployerPackageRepository(),
      candidatePackageRepository: new MockCandidatePackageRepository(),
      entrepreneurPackageRepository: new MockEntrepreneurPackageRepository(),
      investorPackageRepository: new MockInvestorPackageRepository(),
      founderPackageRepository: new MockFounderPackageRepository(),
    });

    const before = await service.listCoupons('franchise');
    expect(before.length).toBeGreaterThan(0);

    const created = await service.createCoupon('franchise', {
      code: 'ADMIN50',
      discountPercent: 50,
      discountCents: null,
      validPackageSlugs: null,
      active: true,
      expiresAt: null,
    });
    expect(created.code).toBe('ADMIN50');
  });
});
