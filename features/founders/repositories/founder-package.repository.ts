import type { FounderPackageId } from '@/lib/domain/ids';
import type {
  FounderPackageCatalogItem,
  FounderUserPackage,
  CreateFounderCatalogInput,
  GrantFounderPackageInput,
  FounderUserPackageFilter,
  FounderUserPackageStatus,
  FounderCoupon,
  FounderPackageSlug,
} from '@/features/founders/types/founder-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface FounderPackageRepository {
  listCatalog(): Promise<FounderPackageCatalogItem[]>;
  getBySlug(slug: FounderPackageSlug): Promise<FounderPackageCatalogItem | null>;
  createCatalogItem(input: CreateFounderCatalogInput): Promise<FounderPackageCatalogItem>;
  findActiveByUser(filter: FounderUserPackageFilter): Promise<FounderUserPackage[]>;
  paginateUserPackages(
    filter: FounderUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<FounderUserPackage>>;
  grant(input: GrantFounderPackageInput): Promise<FounderUserPackage>;
  findById(id: FounderPackageId): Promise<FounderUserPackage | null>;
  updateStatus(id: FounderPackageId, status: FounderUserPackageStatus): Promise<FounderUserPackage>;
  extendDuration(id: FounderPackageId, extraDays: number): Promise<FounderUserPackage>;
  findCoupon(code: string): Promise<FounderCoupon | null>;
  listCoupons(): Promise<FounderCoupon[]>;
  upsertCoupon(input: FounderCoupon): Promise<FounderCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
