import type { Repository } from '@/lib/domain/repository';
import type { ListingTypeId } from '@/lib/domain/ids';
import type { ListingType, CreateListingTypeInput, UpdateListingTypeInput, ListingTypeFilter } from '@/features/listings/types/listing-type.types';

export interface ListingTypeRepository
  extends Repository<ListingType, ListingTypeId, CreateListingTypeInput, UpdateListingTypeInput, ListingTypeFilter> {
  findByCategoryAndSlug(categoryId: ListingType['categoryId'], slug: string): Promise<ListingType | null>;
  findByCategoryId(categoryId: ListingType['categoryId']): Promise<ListingType[]>;
}
