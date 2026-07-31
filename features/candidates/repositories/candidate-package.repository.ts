import type { CandidatePackageId } from '@/lib/domain/ids';
import type {
  CandidatePackageCatalogItem,
  CandidateUserPackage,
  CreateCandidateCatalogInput,
  GrantCandidatePackageInput,
  CandidateUserPackageFilter,
  CandidateUserPackageStatus,
  CandidateCoupon,
  CandidatePackageSlug,
} from '@/features/candidates/types/candidate-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface CandidatePackageRepository {
  listCatalog(): Promise<CandidatePackageCatalogItem[]>;
  getBySlug(slug: CandidatePackageSlug): Promise<CandidatePackageCatalogItem | null>;
  createCatalogItem(input: CreateCandidateCatalogInput): Promise<CandidatePackageCatalogItem>;
  findActiveByUser(filter: CandidateUserPackageFilter): Promise<CandidateUserPackage[]>;
  paginateUserPackages(
    filter: CandidateUserPackageFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<CandidateUserPackage>>;
  grant(input: GrantCandidatePackageInput): Promise<CandidateUserPackage>;
  findById(id: CandidatePackageId): Promise<CandidateUserPackage | null>;
  updateStatus(id: CandidatePackageId, status: CandidateUserPackageStatus): Promise<CandidateUserPackage>;
  extendDuration(id: CandidatePackageId, extraDays: number): Promise<CandidateUserPackage>;
  findCoupon(code: string): Promise<CandidateCoupon | null>;
  listCoupons(): Promise<CandidateCoupon[]>;
  upsertCoupon(input: CandidateCoupon): Promise<CandidateCoupon>;
  deleteCoupon(code: string): Promise<void>;
}
