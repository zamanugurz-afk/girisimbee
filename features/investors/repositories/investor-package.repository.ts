import type { InvestorPackageId } from '@/lib/domain/ids';
import type {
  InvestorPackageCatalogItem,
  InvestorUserPackage,
  CreateInvestorCatalogInput,
  GrantInvestorPackageInput,
  InvestorUserPackageFilter,
  InvestorUserPackageStatus,
  InvestorCoupon,
  InvestorPackageSlug,
} from '@/features/investors/types/investor-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface InvestorPackageRepository {
  listCatalog(): Promise<InvestorPackageCatalogItem[]>;
  getBySlug(slug: InvestorPackageSlug): Promise<InvestorPackageCatalogItem | null>;
  createCatalogItem(input: CreateInvestorCatalogInput): Promise<InvestorPackageCatalogItem>;
  findActiveByUser(filter: InvestorUserPackageFilter): Promise<InvestorUserPackage[]>;
  paginateUserPackages(
    filter: InvestorUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<InvestorUserPackage>>;
  grant(input: GrantInvestorPackageInput): Promise<InvestorUserPackage>;
  findById(id: InvestorPackageId): Promise<InvestorUserPackage | null>;
  updateStatus(id: InvestorPackageId, status: InvestorUserPackageStatus): Promise<InvestorUserPackage>;
  extendDuration(id: InvestorPackageId, extraDays: number): Promise<InvestorUserPackage>;
  findCoupon(code: string): Promise<InvestorCoupon | null>;
  listCoupons(): Promise<InvestorCoupon[]>;
  upsertCoupon(input: InvestorCoupon): Promise<InvestorCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
