import type { Timestamps, SoftDeletable } from '@/lib/domain/base';
import type { SubcategoryStatus } from '@/lib/domain/marketplace-enums';
import type { CategoryId, SubcategoryId } from '@/lib/domain/ids';

export interface Subcategory extends Timestamps, SoftDeletable {
  id: SubcategoryId;
  categoryId: CategoryId;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: SubcategoryStatus;
}

export interface SubcategoryFilter {
  categoryId?: CategoryId;
  slug?: string;
  status?: SubcategoryStatus;
  includeDeleted?: boolean;
}
