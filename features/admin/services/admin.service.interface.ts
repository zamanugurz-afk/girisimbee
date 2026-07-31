import type { UserId, CompanyId, ListingId, ReportId, VerificationId } from '@/lib/domain/ids';
import type { User, UserFilter } from '@/features/authentication/types/user.types';
import type { Company, CompanyFilter } from '@/features/companies/types/company.types';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { Report, ReportFilter } from '@/features/shared/types/report.types';
import type { Verification, VerificationFilter } from '@/features/authentication/types/verification.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type {
  MarketplaceSettings,
  UserListingPackage,
  ListingPackageCatalogItem,
  GrantPackageInput,
  UserPackageFilter,
} from '@/features/monetization/types/listing-package.types';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  dailyVisitors: number;
  totalCompanies: number;
  totalListings: number;
  totalApplications: number;
  totalMessages: number;
  publishedListings: number;
  draftListings: number;
  activeToday: number;
  revenueCents: number;
  conversionRate: number;
}

export interface AdminUserView {
  user: User;
  profile: Profile | null;
  displayName: string;
}

export interface AdminSearchResults {
  users: AdminUserView[];
  companies: Company[];
  listings: Listing[];
}

export interface IAdminService {
  getDashboardStats(): Promise<AdminDashboardStats>;
  globalSearch(query: string, pagination?: PaginationParams): Promise<AdminSearchResults>;

  searchUsers(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<AdminUserView>>;
  suspendUser(id: UserId): Promise<User>;
  activateUser(id: UserId): Promise<User>;
  deactivateUser(id: UserId): Promise<User>;
  deleteUser(id: UserId): Promise<void>;

  searchCompanies(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>>;
  verifyCompany(id: CompanyId): Promise<Company>;
  unverifyCompany(id: CompanyId): Promise<Company>;
  suspendCompany(id: CompanyId): Promise<Company>;
  deleteCompany(id: CompanyId): Promise<void>;

  searchListings(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  listFeaturedListings(pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  listUrgentListings(pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  publishListing(id: ListingId): Promise<Listing>;
  rejectListing(id: ListingId, reason: string): Promise<Listing>;
  featureListing(id: ListingId, featuredUntil?: string): Promise<Listing>;
  unfeatureListing(id: ListingId): Promise<Listing>;
  markListingUrgent(id: ListingId, urgentUntil?: string): Promise<Listing>;
  removeListingUrgent(id: ListingId): Promise<Listing>;
  unpublishListing(id: ListingId): Promise<Listing>;
  archiveListing(id: ListingId): Promise<Listing>;
  deleteListing(id: ListingId): Promise<void>;

  listReports(filter: ReportFilter, pagination?: PaginationParams): Promise<PaginatedResult<Report>>;
  resolveReport(id: ReportId, reviewerId: UserId, resolution: string): Promise<Report>;
  dismissReport(id: ReportId, reviewerId: UserId): Promise<Report>;

  listVerifications(filter: VerificationFilter, pagination?: PaginationParams): Promise<PaginatedResult<Verification>>;
  approveVerification(id: VerificationId, reviewerId: UserId): Promise<Verification>;
  rejectVerification(id: VerificationId, reviewerId: UserId, reason: string): Promise<Verification>;

  getMarketplaceSettings(): Promise<MarketplaceSettings>;
  updateFreeListingLimit(limit: number): Promise<MarketplaceSettings>;
  listPackageCatalog(): Promise<ListingPackageCatalogItem[]>;
  listActivePackages(filter?: UserPackageFilter): Promise<UserListingPackage[]>;
  grantUserPackage(input: GrantPackageInput): Promise<UserListingPackage>;
}
