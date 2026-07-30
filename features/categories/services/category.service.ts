import type { CategoryIntentId, CategoryIntent } from '@/features/categories/types/category.types';
import { CATEGORY_INTENTS } from '@/features/categories/mock/intents.mock';

export function getCategoryIntent(id: CategoryIntentId): CategoryIntent {
  return CATEGORY_INTENTS.find((i) => i.id === id)!;
}

export function getAllCategoryIntents(): CategoryIntent[] {
  return CATEGORY_INTENTS;
}
