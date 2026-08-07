import { describe, expect, it } from 'vitest';
import { ids } from '@/lib/domain/ids';
import {
  expandCategoryIdFilter,
  expandListingTypeIdFilter,
  toLegacyCategoryId,
} from '@/features/listings/config/marketplace-category-map';

describe('marketplace category map', () => {
  it('maps canonical category ids to legacy e-prefix ids', () => {
    const canonical = ids.category('c1000001-0001-4000-8000-000000000001');
    expect(toLegacyCategoryId(canonical)).toBe('e1000001-0001-4000-8000-000000000001');
    expect(expandCategoryIdFilter(canonical)).toEqual([
      'c1000001-0001-4000-8000-000000000001',
      'e1000001-0001-4000-8000-000000000001',
    ]);
  });

  it('expands listing type ids for legacy rows', () => {
    const canonical = ids.listingType('lt000001-0001-4000-8000-000000000001');
    expect(expandListingTypeIdFilter(canonical)).toEqual([
      'lt000001-0001-4000-8000-000000000001',
      'e1000001-0001-4000-8000-000000000001',
    ]);
  });
});
