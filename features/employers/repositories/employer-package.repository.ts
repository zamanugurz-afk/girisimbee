import type { EmployerPackageId } from '@/lib/domain/ids';
import type {
  EmployerPackageCatalogItem,
  EmployerUserPackage,
  CreateEmployerCatalogInput,
  GrantEmployerPackageInput,
  EmployerUserPackageFilter,
  EmployerUserPackageStatus,
  EmployerCoupon,
  EmployerPackageSlug,
} from '@/features/employers/types/employer-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface EmployerPackageRepository {
  listCatalog(): Promise<EmployerPackageCatalogItem[]>;
  getBySlug(slug: EmployerPackageSlug): Promise<EmployerPackageCatalogItem | null>;
  createCatalogItem(input: CreateEmployerCatalogInput): Promise<EmployerPackageCatalogItem>;
  findActiveByUser(filter: EmployerUserPackageFilter): Promise<EmployerUserPackage[]>;
  paginateUserPackages(
    filter: EmployerUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<EmployerUserPackage>>;
  grant(input: GrantEmployerPackageInput): Promise<EmployerUserPackage>;
  findById(id: EmployerPackageId): Promise<EmployerUserPackage | null>;
  updateStatus(id: EmployerPackageId, status: EmployerUserPackageStatus): Promise<EmployerUserPackage>;
  extendDuration(id: EmployerPackageId, extraDays: number): Promise<EmployerUserPackage>;
  findCoupon(code: string): Promise<EmployerCoupon | null>;
  listCoupons(): Promise<EmployerCoupon[]>;
  upsertCoupon(input: EmployerCoupon): Promise<EmployerCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
