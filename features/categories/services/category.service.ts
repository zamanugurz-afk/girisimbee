import type { CategoryIntentId, CategoryIntent } from '@/features/categories/types/category.types';
import { CATEGORY_INTENTS } from '@/features/categories/mock/intents.mock';

export function getCategoryIntent(id: CategoryIntentId): CategoryIntent {
  const hit = CATEGORY_INTENTS.find((i) => i.id === id);
  if (hit) return hit;
  // Legacy: find-job historically aliased to hire UI cards
  if (id === 'find-job') {
    return CATEGORY_INTENTS.find((i) => i.id === 'hire')!;
  }
  return CATEGORY_INTENTS[0]!;
}

export function getAllCategoryIntents(): CategoryIntent[] {
  return CATEGORY_INTENTS;
}
