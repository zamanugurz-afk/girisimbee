import type { EntrepreneurPackageId } from '@/lib/domain/ids';
import type {
  EntrepreneurPackageCatalogItem,
  EntrepreneurUserPackage,
  CreateEntrepreneurCatalogInput,
  GrantEntrepreneurPackageInput,
  EntrepreneurUserPackageFilter,
  EntrepreneurUserPackageStatus,
  EntrepreneurCoupon,
  EntrepreneurPackageSlug,
} from '@/features/entrepreneurs/types/entrepreneur-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface EntrepreneurPackageRepository {
  listCatalog(): Promise<EntrepreneurPackageCatalogItem[]>;
  getBySlug(slug: EntrepreneurPackageSlug): Promise<EntrepreneurPackageCatalogItem | null>;
  createCatalogItem(input: CreateEntrepreneurCatalogInput): Promise<EntrepreneurPackageCatalogItem>;
  findActiveByUser(filter: EntrepreneurUserPackageFilter): Promise<EntrepreneurUserPackage[]>;
  paginateUserPackages(
    filter: EntrepreneurUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<EntrepreneurUserPackage>>;
  grant(input: GrantEntrepreneurPackageInput): Promise<EntrepreneurUserPackage>;
  findById(id: EntrepreneurPackageId): Promise<EntrepreneurUserPackage | null>;
  updateStatus(id: EntrepreneurPackageId, status: EntrepreneurUserPackageStatus): Promise<EntrepreneurUserPackage>;
  extendDuration(id: EntrepreneurPackageId, extraDays: number): Promise<EntrepreneurUserPackage>;
  findCoupon(code: string): Promise<EntrepreneurCoupon | null>;
  listCoupons(): Promise<EntrepreneurCoupon[]>;
  upsertCoupon(input: EntrepreneurCoupon): Promise<EntrepreneurCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
