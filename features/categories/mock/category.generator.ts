import { createSeedCategories } from '@/features/categories/factories/category.factory';
import type { Category } from '@/features/categories/types/category.entity.types';

export function generateMockCategories(): Category[] {
  return createSeedCategories();
}

export function generateMockCategory(index = 1): Category {
  const categories = createSeedCategories();
  return categories[(index - 1) % categories.length];
}
