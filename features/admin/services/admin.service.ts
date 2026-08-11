import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import type { UserId, CompanyId, ListingId, ReportId, VerificationId } from '@/lib/domain/ids';
import type { User, UserFilter } from '@/features/authentication/types/user.types';
import type { CompanyFilter } from '@/features/companies/types/company.types';
import type { ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { ReportFilter } from '@/features/shared/types/report.types';
import type { VerificationFilter } from '@/features/authentication/types/verification.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { IAdminService, AdminDashboardStats, AdminUserView, AdminSearchResults } from '@/features/admin/services/admin.service.interface';
import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import type { ReportRepository } from '@/features/shared/repositories/report.repository';
import type { VerificationRepository } from '@/features/authentication/repositories/verification.repository';
import type { IListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { GrantPackageInput, UserPackageFilter, PublishEntitlementResult } from '@/features/monetization/types/listing-package.types';
import type { IVerificationService } from '@/features/authentication/services/auth.service.interface';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function defaultFeaturedUntil(): string {
  return new Date(Date.now() + 30 * 86400000).toISOString();
}

function defaultUrgentUntil(): string {
  return new Date(Date.now() + 30 * 86400000).toISOString();
}

export class AdminService implements IAdminService {
  constructor(
    private userRepo: UserRepository,
    private profileRepo: ProfileRepository,
    private companyRepo: CompanyRepository,
    private listingRepo: ListingRepository,
    private messageRepo: MessageRepository,
    private reportRepo: ReportRepository,
    private verificationRepo: VerificationRepository,
    private packageService: IListingPackageService,
    private verificationService: IVerificationService,
    private applicationRepo: ApplicationRepository,
    private paymentRepo: PaymentRepository,
    private activityRepo: ActivityRepository,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const today = startOfTodayIso();
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      totalListings,
      totalApplications,
      totalMessages,
      publishedListings,
      draftListings,
      activeToday,
      dailyVisitors,
      succeededPayments,
    ] = await Promise.all([
      this.userRepo.count({}),
      this.userRepo.count({ status: 'active' }),
      this.companyRepo.count({}),
      this.listingRepo.count({}),
      this.applicationRepo.count({}),
      this.messageRepo.count({}),
      this.listingRepo.count({ status: 'published' }),
      this.listingRepo.count({ status: 'draft' }),
      this.userRepo.count({ activeSince: today }),
      this.activityRepo.count({ after: today }),
      this.paymentRepo.findMany({ status: 'succeeded' }, { page: 1, limit: 10000 }),
    ]);

    const revenueCents = succeededPayments.data.reduce((sum, p) => sum + p.amountCents, 0);
    const conversionRate =
      totalListings > 0 ? Math.round((totalApplications / totalListings) * 10000) / 100 : 0;

    return {
      totalUsers,
      activeUsers,
      dailyVisitors: dailyVisitors || activeToday,
      totalCompanies,
      totalListings,
      totalApplications,
      totalMessages,
      publishedListings,
      draftListings,
      activeToday,
      revenueCents,
      conversionRate,
    };
  }

  private async enrichUser(user: User): Promise<AdminUserView> {
    const profile = await this.profileRepo.findByUserId(user.id);
    return {
      user,
      profile,
      displayName: profile?.displayName ?? user.email.split('@')[0] ?? 'Kullanıcı',
    };
  }

  async searchUsers(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<AdminUserView>> {
    const result = await this.userRepo.search(filter, pagination);
    const data = await Promise.all(result.data.map((u) => this.enrichUser(u)));
    return { ...result, data };
  }

  suspendUser(id: UserId): Promise<User> {
    return this.userRepo.transitionStatus(id, 'suspended');
  }

  activateUser(id: UserId): Promise<User> {
    return this.userRepo.transitionStatus(id, 'active');
  }

  deactivateUser(id: UserId): Promise<User> {
    return this.userRepo.transitionStatus(id, 'deactivated');
  }

  deleteUser(id: UserId): Promise<void> {
    return this.userRepo.delete(id);
  }

  searchCompanies(filter: CompanyFilter, pagination?: PaginationParams) {
    return this.companyRepo.search(filter, pagination);
  }

  async verifyCompany(id: CompanyId) {
    const company = await this.companyRepo.findById(id);
    if (!company) throw new NotFoundError('Company', id);
    return this.companyRepo.update(id, { isVerified: true });
  }

  async unverifyCompany(id: CompanyId) {
    const company = await this.companyRepo.findById(id);
    if (!company) throw new NotFoundError('Company', id);
    return this.companyRepo.update(id, { isVerified: false });
  }

  suspendCompany(id: CompanyId) {
    return this.companyRepo.transitionStatus(id, 'suspended');
  }

  deleteCompany(id: CompanyId) {
    return this.companyRepo.delete(id);
  }

  searchListings(filter: ListingFilter, pagination?: PaginationParams) {
    return this.listingRepo.search(filter, pagination);
  }

  listFeaturedListings(pagination?: PaginationParams) {
    return this.listingRepo.search({ isFeatured: true, activeFeaturedOnly: true }, pagination);
  }

  listUrgentListings(pagination?: PaginationParams) {
    return this.listingRepo.search({ isUrgent: true, activeUrgentOnly: true }, pagination);
  }

  async publishListing(id: ListingId) {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);

    const isFirstPublish = listing.publishedAt === null;
    let entitlement: PublishEntitlementResult | null = null;
    if (isFirstPublish) {
      entitlement = await this.packageService.assertCanPublish(listing.ownerId, listing);
    }

    const updated = await this.listingRepo.transitionStatus(id, 'published');

    if (isFirstPublish && entitlement) {
      await this.packageService.onListingPublished(listing.ownerId, listing, entitlement);
    }

    return updated;
  }

  async rejectListing(id: ListingId, reason: string) {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);
    await this.listingRepo.transitionStatus(id, 'rejected');
    return this.listingRepo.update(id, { rejectedReason: reason });
  }

  async featureListing(id: ListingId, featuredUntil?: string) {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);
    return this.listingRepo.update(id, {
      isFeatured: true,
      featuredUntil: featuredUntil ?? defaultFeaturedUntil(),
    });
  }

  unfeatureListing(id: ListingId) {
    return this.listingRepo.update(id, { isFeatured: false, featuredUntil: null });
  }

  async markListingUrgent(id: ListingId, urgentUntil?: string) {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);
    return this.listingRepo.update(id, {
      isUrgent: true,
      urgentUntil: urgentUntil ?? defaultUrgentUntil(),
    });
  }

  removeListingUrgent(id: ListingId) {
    return this.listingRepo.update(id, { isUrgent: false, urgentUntil: null });
  }

  async extendListingExpiry(id: ListingId, days = 30) {
    const listing = await this.listingRepo.findById(id);
    if (!listing) throw new NotFoundError('Listing', id);
    const baseMs = listing.expiresAt
      ? Math.max(Date.now(), new Date(listing.expiresAt).getTime())
      : Date.now();
    const expiresAt = new Date(baseMs + days * 86400000).toISOString();
    return this.listingRepo.update(id, { expiresAt });
  }

  unpublishListing(id: ListingId) {
    return this.listingRepo.transitionStatus(id, 'paused');
  }

  archiveListing(id: ListingId) {
    return this.listingRepo.transitionStatus(id, 'archived');
  }

  deleteListing(id: ListingId) {
    return this.listingRepo.delete(id);
  }

  listReports(filter: ReportFilter, pagination?: PaginationParams) {
    return this.reportRepo.paginate(filter, pagination);
  }

  async resolveReport(id: ReportId, reviewerId: UserId, resolution: string) {
    const report = await this.reportRepo.findById(id);
    if (!report) throw new NotFoundError('Report', id);
    if (report.status === 'submitted') await this.reportRepo.transitionStatus(id, 'in_review');
    await this.reportRepo.transitionStatus(id, 'resolved');
    return this.reportRepo.update(id, {
      reviewerId,
      reviewedAt: now(),
      resolution,
    });
  }

  async dismissReport(id: ReportId, reviewerId: UserId) {
    const report = await this.reportRepo.findById(id);
    if (!report) throw new NotFoundError('Report', id);
    if (report.status === 'submitted') await this.reportRepo.transitionStatus(id, 'in_review');
    await this.reportRepo.transitionStatus(id, 'dismissed');
    return this.reportRepo.update(id, {
      reviewerId,
      reviewedAt: now(),
    });
  }

  listVerifications(filter: VerificationFilter, pagination?: PaginationParams) {
    return this.verificationRepo.paginate(filter, pagination);
  }

  async approveVerification(id: VerificationId, reviewerId: UserId) {
    await this.verificationService.approve(id, reviewerId);
    const updated = await this.verificationRepo.findById(id);
    if (!updated) throw new NotFoundError('Verification', id);
    return updated;
  }

  async rejectVerification(id: VerificationId, reviewerId: UserId, reason: string) {
    await this.verificationService.reject(id, reviewerId, reason);
    const updated = await this.verificationRepo.findById(id);
    if (!updated) throw new NotFoundError('Verification', id);
    return updated;
  }

  async globalSearch(query: string, pagination?: PaginationParams): Promise<AdminSearchResults> {
    const q = query.trim();
    if (!q) return { users: [], companies: [], listings: [] };
    const [usersResult, companiesResult, listingsResult] = await Promise.all([
      this.searchUsers({ query: q }, pagination),
      this.companyRepo.search({ query: q }, pagination),
      this.listingRepo.search({ query: q }, pagination),
    ]);
    return {
      users: usersResult.data,
      companies: companiesResult.data,
      listings: listingsResult.data,
    };
  }

  getMarketplaceSettings() {
    return this.packageService.getSettings();
  }

  updateFreeListingLimit(limit: number) {
    return this.packageService.updateFreeListingLimit(limit);
  }

  listPackageCatalog() {
    return this.packageService.listCatalog();
  }

  listActivePackages(filter?: UserPackageFilter) {
    return this.packageService.listActivePackages(filter);
  }

  grantUserPackage(input: GrantPackageInput) {
    return this.packageService.grantPackage(input);
  }
}
