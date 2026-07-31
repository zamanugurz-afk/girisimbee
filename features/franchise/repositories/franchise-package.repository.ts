import type { FranchisePackageId } from '@/lib/domain/ids';
import type {
  FranchisePackageCatalogItem,
  FranchiseUserPackage,
  CreateFranchiseCatalogInput,
  GrantFranchisePackageInput,
  FranchiseUserPackageFilter,
  FranchiseUserPackageStatus,
  FranchiseCoupon,
  FranchisePackageSlug,
} from '@/features/franchise/types/franchise-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface FranchisePackageRepository {
  listCatalog(): Promise<FranchisePackageCatalogItem[]>;
  getBySlug(slug: FranchisePackageSlug): Promise<FranchisePackageCatalogItem | null>;
  createCatalogItem(input: CreateFranchiseCatalogInput): Promise<FranchisePackageCatalogItem>;
  findActiveByUser(filter: FranchiseUserPackageFilter): Promise<FranchiseUserPackage[]>;
  paginateUserPackages(
    filter: FranchiseUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<FranchiseUserPackage>>;
  grant(input: GrantFranchisePackageInput): Promise<FranchiseUserPackage>;
  findById(id: FranchisePackageId): Promise<FranchiseUserPackage | null>;
  updateStatus(id: FranchisePackageId, status: FranchiseUserPackageStatus): Promise<FranchiseUserPackage>;
  extendDuration(id: FranchisePackageId, extraDays: number): Promise<FranchiseUserPackage>;
  findCoupon(code: string): Promise<FranchiseCoupon | null>;
  listCoupons(): Promise<FranchiseCoupon[]>;
  upsertCoupon(input: FranchiseCoupon): Promise<FranchiseCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
