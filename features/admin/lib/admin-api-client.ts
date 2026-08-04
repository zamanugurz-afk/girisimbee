import type { AdminDashboardStats, AdminSearchResults, AdminUserView } from '@/features/admin/services/admin.service.interface';
import type {
  AdminApplicationAction,
  AdminCouponInput,
  AdminCouponView,
  AdminListingAction,
  AdminPackageCatalogView,
  AdminReportSnapshot,
  AdminSettingsView,
  AdminUserAction,
  AdminProfileView,
} from '@/features/admin/types/admin.types';
import type { UserFilter } from '@/features/authentication/types/user.types';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';
import type { Company } from '@/features/companies/types/company.types';
import type { UserId, ListingId, ApplicationId, CompanyId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

type QueryValue = string | number | boolean | undefined | null;

function toQueryValue(value: unknown): QueryValue {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value);
}

function buildQuery(params: Record<string, QueryValue>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const normalized = toQueryValue(value);
    if (normalized === undefined) continue;
    sp.set(key, String(normalized));
  }
  const query = sp.toString();
  return query ? `?${query}` : '';
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `İstek başarısız (${res.status})`);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as { data: T };
  return json.data;
}

function paginationParams(pagination?: PaginationParams): Record<string, QueryValue> {
  return {
    page: pagination?.page,
    limit: pagination?.limit,
  };
}

export const adminApi = {
  getDashboard(): Promise<AdminDashboardStats> {
    return adminFetch<{ stats: AdminDashboardStats }>('/api/admin/dashboard').then((r) => r.stats);
  },

  searchUsers(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<AdminUserView>> {
    return adminFetch(
      `/api/admin/users${buildQuery({
        query: filter.query,
        status: toQueryValue(filter.status),
        role: filter.role,
        ...paginationParams(pagination),
      })}`,
    );
  },

  patchUser(id: UserId, action: AdminUserAction): Promise<{ user?: unknown } | void> {
    return adminFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(action),
    });
  },

  searchListings(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    return adminFetch(
      `/api/admin/listings${buildQuery({
        query: filter.query,
        status: toQueryValue(filter.status),
        moduleKey: filter.moduleKey,
        isFeatured: filter.isFeatured,
        isUrgent: filter.isUrgent,
        activeFeaturedOnly: filter.activeFeaturedOnly,
        activeUrgentOnly: filter.activeUrgentOnly,
        ...paginationParams(pagination),
      })}`,
    );
  },

  patchListing(id: ListingId, action: AdminListingAction): Promise<{ listing?: Listing } | void> {
    return adminFetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(action),
    });
  },

  searchProfiles(
    filter: { moduleKey?: ModuleKey; query?: string; status?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<AdminProfileView>> {
    return adminFetch(
      `/api/admin/profiles${buildQuery({
        moduleKey: filter.moduleKey,
        query: filter.query,
        status: filter.status,
        ...paginationParams(pagination),
      })}`,
    );
  },

  listApplications(
    filter: { moduleKey?: MarketplaceApplication['moduleKey']; status?: string | string[]; includeDeleted?: boolean },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceApplication>> {
    const status = Array.isArray(filter.status) ? filter.status.join(',') : filter.status;
    return adminFetch(
      `/api/admin/applications${buildQuery({
        moduleKey: filter.moduleKey,
        status,
        includeDeleted: filter.includeDeleted,
        ...paginationParams(pagination),
      })}`,
    );
  },

  patchApplication(id: ApplicationId, action: AdminApplicationAction): Promise<{ application?: MarketplaceApplication }> {
    return adminFetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(action),
    });
  },

  getSettings(): Promise<AdminSettingsView> {
    return adminFetch<{ settings: AdminSettingsView }>('/api/admin/settings').then((r) => r.settings);
  },

  patchSettings(patch: { freeListingLimit?: number }): Promise<AdminSettingsView> {
    return adminFetch<{ settings: AdminSettingsView }>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).then((r) => r.settings);
  },

  listPackages(moduleKey?: ModuleKey): Promise<{ catalogs: AdminPackageCatalogView[] } | { catalog: AdminPackageCatalogView }> {
    return adminFetch(`/api/admin/packages${buildQuery({ moduleKey })}`);
  },

  activatePackage(input: { moduleKey: ModuleKey; userId: string; packageSlug: string }) {
    return adminFetch('/api/admin/packages', {
      method: 'POST',
      body: JSON.stringify({
        action: 'activate',
        moduleKey: input.moduleKey,
        userId: input.userId,
        packageSlug: input.packageSlug,
      }),
    });
  },

  listCoupons(moduleKey: ModuleKey): Promise<AdminCouponView[]> {
    return adminFetch<{ coupons: AdminCouponView[] }>(`/api/admin/coupons${buildQuery({ moduleKey })}`).then(
      (r) => r.coupons,
    );
  },

  createCoupon(moduleKey: ModuleKey, input: AdminCouponInput): Promise<AdminCouponView> {
    return adminFetch<{ coupon: AdminCouponView }>(`/api/admin/coupons${buildQuery({ moduleKey })}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((r) => r.coupon);
  },

  deleteCoupon(moduleKey: ModuleKey, code: string): Promise<void> {
    return adminFetch(`/api/admin/coupons${buildQuery({ moduleKey, code })}`, { method: 'DELETE' });
  },

  generateReport(
    period: 'daily' | 'weekly' | 'monthly' | 'custom',
    category?: string,
    range?: { from?: string; to?: string },
  ): Promise<AdminReportSnapshot> {
    return adminFetch<{ report: AdminReportSnapshot }>(
      `/api/admin/reports${buildQuery({
        period,
        category: category === 'all' ? undefined : category,
        from: range?.from,
        to: range?.to,
      })}`,
    ).then((r) => r.report);
  },

  listModerationReports(
    filter: { status?: string; entityType?: string; query?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<import('@/features/shared/types/report.types').Report>> {
    return adminFetch(
      `/api/admin/moderation${buildQuery({
        status: filter.status,
        entityType: filter.entityType,
        query: filter.query,
        ...paginationParams(pagination),
      })}`,
    );
  },

  moderationAction(
    id: string,
    action: { action: 'resolve'; resolution: string } | { action: 'dismiss' } | { action: 'review' },
  ): Promise<import('@/features/shared/types/report.types').Report> {
    return adminFetch<{ report: import('@/features/shared/types/report.types').Report }>(
      `/api/admin/moderation${buildQuery({ id })}`,
      { method: 'PATCH', body: JSON.stringify(action) },
    ).then((r) => r.report);
  },

  listRecentNotifications(limit = 50): Promise<
    Array<{
      id: string;
      userId: string;
      title: string;
      description: string | null;
      type: string;
      isRead: boolean;
      createdAt: string;
    }>
  > {
    return adminFetch<{ notifications: Array<{
      id: string;
      userId: string;
      title: string;
      description: string | null;
      type: string;
      isRead: boolean;
      createdAt: string;
    }> }>(`/api/admin/notifications${buildQuery({ limit })}`).then((r) => r.notifications);
  },

  listPayments(
    filter: { userId?: string; status?: string; purpose?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplacePayment>> {
    return adminFetch(
      `/api/admin/payments${buildQuery({
        userId: filter.userId,
        status: filter.status,
        purpose: filter.purpose,
        ...paginationParams(pagination),
      })}`,
    );
  },

  async globalSearch(query: string, pagination?: PaginationParams): Promise<AdminSearchResults> {
    const q = query.trim();
    if (!q) return { users: [], companies: [], listings: [] };

    const [usersResult, profilesResult, listingsResult] = await Promise.all([
      adminApi.searchUsers({ query: q }, pagination),
      adminApi.searchProfiles({ query: q }, pagination),
      adminApi.searchListings({ query: q }, pagination),
    ]);

    const companies: Company[] = profilesResult.data
      .filter(({ profile }) => profile.companyId && profile.companyName)
      .map(({ profile }) => ({
        id: profile.companyId as CompanyId,
        ownerId: profile.userId as UserId,
        name: profile.companyName ?? profile.displayName,
        slug: profile.username ?? String(profile.companyId),
        logoUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
        description: profile.bio,
        website: profile.website,
        linkedInUrl: profile.linkedInUrl,
        twitterUrl: profile.twitterUrl,
        city: profile.city,
        location: profile.location,
        country: profile.country,
        industry: null,
        employeeCount: null,
        foundedYear: null,
        contactEmail: profile.email,
        isVerified: profile.isVerified,
        websiteVerified: false,
        emailVerified: false,
        status: profile.status === 'published' ? 'active' : 'draft',
        metadata: {},
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        deletedAt: profile.deletedAt,
      }));

    return {
      users: usersResult.data,
      companies,
      listings: listingsResult.data,
    };
  },
};
