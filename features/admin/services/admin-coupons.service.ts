import { NotFoundError, ValidationError } from '@/lib/domain/errors';
import type { ModuleKey } from '@/lib/domain/modules';
import type { EcosystemServices } from '@/lib/persistence/ecosystem-services';
import type { FranchisePackageRepository } from '@/features/franchise/repositories/franchise-package.repository';
import type { EmployerPackageRepository } from '@/features/employers/repositories/employer-package.repository';
import type { CandidatePackageRepository } from '@/features/candidates/repositories/candidate-package.repository';
import type { EntrepreneurPackageRepository } from '@/features/entrepreneurs/repositories/entrepreneur-package.repository';
import type { InvestorPackageRepository } from '@/features/investors/repositories/investor-package.repository';
import type { FounderPackageRepository } from '@/features/founders/repositories/founder-package.repository';
import type {
  AdminCouponInput,
  AdminCouponView,
  AdminModuleCoupon,
  AdminReportPeriod,
  AdminReportCategory,
  AdminReportSnapshot,
} from '@/features/admin/types/admin.types';
import type { AdminDashboardService } from '@/features/admin/services/admin-dashboard.service';
import type { ReportRepository } from '@/features/shared/repositories/report.repository';
import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';
import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';
import { now } from '@/lib/domain/factory';

export interface ModuleCouponRepositoryPort {
  listCoupons(): Promise<AdminModuleCoupon[]>;
  upsertCoupon(input: AdminModuleCoupon): Promise<AdminModuleCoupon>;
  deleteCoupon(code: string): Promise<void>;
}

export class AdminCouponsService {
  constructor(private ports: Partial<Record<ModuleKey, ModuleCouponRepositoryPort>>) {}

  static fromPackageRepos(repos: {
    franchisePackageRepository: FranchisePackageRepository;
    employerPackageRepository: EmployerPackageRepository;
    candidatePackageRepository: CandidatePackageRepository;
    entrepreneurPackageRepository: EntrepreneurPackageRepository;
    investorPackageRepository: InvestorPackageRepository;
    founderPackageRepository: FounderPackageRepository;
  }): AdminCouponsService {
    return new AdminCouponsService({
      franchise: repos.franchisePackageRepository as unknown as ModuleCouponRepositoryPort,
      employers: repos.employerPackageRepository as unknown as ModuleCouponRepositoryPort,
      candidates: repos.candidatePackageRepository as unknown as ModuleCouponRepositoryPort,
      entrepreneurs: repos.entrepreneurPackageRepository as unknown as ModuleCouponRepositoryPort,
      investors: repos.investorPackageRepository as unknown as ModuleCouponRepositoryPort,
      founders: repos.founderPackageRepository as unknown as ModuleCouponRepositoryPort,
    });
  }

  /** @deprecated Use fromPackageRepos */
  static fromContainer(container: {
    franchisePackageRepository: FranchisePackageRepository;
    employerPackageRepository: EmployerPackageRepository;
    candidatePackageRepository: CandidatePackageRepository;
    entrepreneurPackageRepository: EntrepreneurPackageRepository;
    investorPackageRepository: InvestorPackageRepository;
    founderPackageRepository: FounderPackageRepository;
  }): AdminCouponsService {
    return AdminCouponsService.fromPackageRepos(container);
  }

  private port(moduleKey: ModuleKey): ModuleCouponRepositoryPort {
    const repo = this.ports[moduleKey];
    if (!repo?.listCoupons) {
      throw new NotFoundError('ModuleCouponRepository', moduleKey);
    }
    return repo;
  }

  async listCoupons(moduleKey: ModuleKey): Promise<AdminCouponView[]> {
    const coupons = await this.port(moduleKey).listCoupons();
    return coupons.map((c) => ({ ...c, moduleKey }));
  }

  async createCoupon(moduleKey: ModuleKey, input: AdminCouponInput): Promise<AdminCouponView> {
    const coupon = await this.port(moduleKey).upsertCoupon({
      code: input.code.toUpperCase(),
      discountPercent: input.discountPercent ?? null,
      discountCents: input.discountCents ?? null,
      validPackageSlugs: input.validPackageSlugs ?? null,
      active: input.active ?? true,
      expiresAt: input.expiresAt ?? null,
    });
    return { ...coupon, moduleKey };
  }

  async updateCoupon(moduleKey: ModuleKey, code: string, input: Partial<AdminCouponInput>): Promise<AdminCouponView> {
    const existing = (await this.port(moduleKey).listCoupons()).find(
      (c) => c.code.toUpperCase() === code.toUpperCase(),
    );
    if (!existing) throw new NotFoundError('Coupon', code);

    const coupon = await this.port(moduleKey).upsertCoupon({
      ...existing,
      ...input,
      code: existing.code,
    });
    return { ...coupon, moduleKey };
  }

  async deleteCoupon(moduleKey: ModuleKey, code: string): Promise<void> {
    await this.port(moduleKey).deleteCoupon(code);
  }
}

export class AdminReportService {
  constructor(
    private dashboardMetrics: AdminDashboardService,
    private userRepo: UserRepository,
    private listingRepo: ListingRepository,
    private applicationRepo: ApplicationRepository,
    private paymentRepo: PaymentRepository,
    private reportRepo: ReportRepository,
  ) {}

  async generateReport(
    period: AdminReportPeriod,
    category?: AdminReportCategory | 'all',
    range?: { from?: string; to?: string },
  ): Promise<AdminReportSnapshot> {
    const cat = category ?? 'all';
    const base = await this.dashboardMetrics.getPeriodMetrics(period, range);
    const metrics: Record<string, number> = { ...base };

    if (cat === 'all' || cat === 'users') {
      metrics.totalUsers = await this.userRepo.count({});
      metrics.activeUsers = await this.userRepo.count({ status: 'active' });
    }
    if (cat === 'all' || cat === 'listings') {
      metrics.totalListings = await this.listingRepo.count({});
      metrics.publishedListings = await this.listingRepo.count({ status: 'published' });
    }
    if (cat === 'all' || cat === 'applications') {
      metrics.totalApplications = await this.applicationRepo.count({});
    }
    if (cat === 'all' || cat === 'payments') {
      const { data } = await this.paymentRepo.findMany({ status: 'succeeded' }, { page: 1, limit: 10000 });
      metrics.succeededPayments = data.length;
      metrics.revenueCents = data.reduce((s, p) => s + p.amountCents, 0);
    }
    if (cat === 'all' || cat === 'reports') {
      metrics.openReports = await this.reportRepo.count({ status: ['submitted', 'in_review'] });
      metrics.resolvedReports = await this.reportRepo.count({ status: 'resolved' });
    }

    return {
      period,
      category: cat,
      generatedAt: now(),
      metrics,
    };
  }
}

export class AdminSettingsService {
  constructor(private settingsRepo: MarketplaceSettingsRepository) {}

  getSettings(): Promise<MarketplaceSettings> {
    return this.settingsRepo.get();
  }

  async patchSettings(input: { freeListingLimit?: number }): Promise<MarketplaceSettings> {
    if (input.freeListingLimit === undefined) {
      throw new ValidationError('Güncellenecek ayar belirtilmedi.', { freeListingLimit: ['Gerekli alan.'] });
    }
    return this.settingsRepo.updateFreeListingLimit(input.freeListingLimit);
  }
}
