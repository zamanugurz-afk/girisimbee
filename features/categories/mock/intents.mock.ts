import type { CategoryIntentId } from '@/features/categories/types/category.types';

export type { CategoryIntentId, ContentItem, CategorySection, CategoryIntent } from '@/features/categories/types/category.types';

export { INTENTS as CATEGORY_INTENTS } from '@/features/categories/mock/intents.data';

/** @deprecated Use CategoryIntentId */
export type IntentId = CategoryIntentId;
