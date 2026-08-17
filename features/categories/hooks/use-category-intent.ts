'use client';

import { useMemo, useState } from 'react';
import {
  getAllCategoryIntents,
  getCategoryIntent,
} from '@/features/categories/services/category.service';
import type { CategoryIntentId } from '@/features/categories/types/category.types';

export function useCategoryIntent(initial: CategoryIntentId = 'hire') {
  const [intentId, setIntentId] = useState<CategoryIntentId>(initial);
  const intent = useMemo(() => getCategoryIntent(intentId), [intentId]);
  const allIntents = useMemo(() => getAllCategoryIntents(), []);
  return { intentId, setIntentId, intent, allIntents };
}
