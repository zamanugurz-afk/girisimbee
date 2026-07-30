import type { ListingPackageId } from '@/lib/domain/ids';
import type {
  ListingPackageCatalogItem,
  UserListingPackage,
  GrantPackageInput,
  UserPackageFilter,
} from '@/features/monetization/types/listing-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface ListingPackageRepository {
  listCatalog(): Promise<ListingPackageCatalogItem[]>;
  findActiveByUser(filter: UserPackageFilter): Promise<UserListingPackage[]>;
  paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams): Promise<PaginatedResult<UserListingPackage>>;
  grant(input: GrantPackageInput): Promise<UserListingPackage>;
  consumeCredit(packageId: ListingPackageId, listingId: import('@/lib/domain/ids').ListingId): Promise<UserListingPackage>;
  findById(id: ListingPackageId): Promise<UserListingPackage | null>;
}
