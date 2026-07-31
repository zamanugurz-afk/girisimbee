import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { AdminDashboardStats } from '@/features/admin/services/admin.service.interface';

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthIso(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class AdminDashboardService {
  constructor(
    private userRepo: UserRepository,
    private companyRepo: CompanyRepository,
    private listingRepo: ListingRepository,
    private messageRepo: MessageRepository,
    private applicationRepo: ApplicationRepository,
    private paymentRepo: PaymentRepository,
    private activityRepo: ActivityRepository,
  ) {}

  async getStats(): Promise<AdminDashboardStats> {
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

  async getPeriodMetrics(period: 'daily' | 'monthly'): Promise<Record<string, number>> {
    const since = period === 'daily' ? startOfTodayIso() : startOfMonthIso();
    const [newUsers, newListings, newApplications, payments, visitors] = await Promise.all([
      this.userRepo.count({ activeSince: since }),
      this.listingRepo.count({ publishedAfter: since }),
      this.applicationRepo.count({ submittedAfter: since }),
      this.paymentRepo.findMany({ status: 'succeeded' }, { page: 1, limit: 10000 }),
      this.activityRepo.count({ after: since }),
    ]);

    const revenueCents = payments.data
      .filter((p) => p.paidAt && p.paidAt >= since)
      .reduce((sum, p) => sum + p.amountCents, 0);

    return {
      newUsers,
      newListings,
      newApplications,
      revenueCents,
      visitors,
    };
  }
}

/** @deprecated Metrics moved to AdminDashboardService — kept for backward compat wiring */
export { AdminDashboardService as AdminReportMetricsHelper };
