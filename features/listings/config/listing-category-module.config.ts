/**
 * Maps listing creation categories to ecosystem module keys and publish routes.
 *
 * Note: `dijital-ai` intentionally has no entry here — it publishes via the
 * shared listing-engine path (`createListing` / `publishListing`), not a module REST API.
 */
import type { CategoryId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

export interface ListingCategoryModuleConfig {
  moduleKey: ModuleKey;
  franchiseFlow?: FranchiseFlow;
  /** REST API path for publish (?publish=true) */
  publishApiPath: string;
  /** Post-publish redirect — `{slug}` replaced with listing slug */
  detailPathTemplate: string;
}

/** Category ID → module publish configuration */
export const LISTING_CATEGORY_MODULE_MAP: Partial<Record<CategoryId, ListingCategoryModuleConfig>> = {
  [CATEGORY_IDS.yatirimBul]: {
    moduleKey: 'entrepreneurs',
    publishApiPath: '/api/entrepreneurs/listings',
    detailPathTemplate: '/ilan/{slug}',
  },
  [CATEGORY_IDS.yatirimYap]: {
    moduleKey: 'investors',
    publishApiPath: '/api/investors/listings',
    detailPathTemplate: '/ilan/{slug}',
  },
  [CATEGORY_IDS.isBul]: {
    moduleKey: 'candidates',
    publishApiPath: '/api/candidates/listings',
    detailPathTemplate: '/ilan/{slug}',
  },
  [CATEGORY_IDS.iseAl]: {
    moduleKey: 'employers',
    publishApiPath: '/api/employers/listings',
    detailPathTemplate: '/ilan/{slug}',
  },
  [CATEGORY_IDS.ortakBul]: {
    moduleKey: 'founders',
    publishApiPath: '/api/founders/listings',
    detailPathTemplate: '/ilan/{slug}',
  },
  [CATEGORY_IDS.bayilikAl]: {
    moduleKey: 'franchise',
    franchiseFlow: 'give',
    publishApiPath: '/api/franchise/listings',
    detailPathTemplate: '/franchise/buy/{slug}',
  },
};

export function getListingCategoryModule(categoryId: CategoryId): ListingCategoryModuleConfig | null {
  return LISTING_CATEGORY_MODULE_MAP[categoryId] ?? null;
}

export function usesModulePublish(categoryId: CategoryId): boolean {
  return getListingCategoryModule(categoryId) !== null;
}

/** Module REST publish does not attach platform company profiles — only legacy listing-engine edit does. */
export function supportsCompanyPublisher(categoryId: CategoryId): boolean {
  return !usesModulePublish(categoryId);
}

/** @deprecated Use usesModulePublish */
export function usesFranchisePublish(categoryId: CategoryId): boolean {
  const config = getListingCategoryModule(categoryId);
  return config?.moduleKey === 'franchise' && config.franchiseFlow === 'give';
}

export function getModuleListingDetailPath(categoryId: CategoryId, slug: string): string {
  const config = getListingCategoryModule(categoryId);
  if (!config) return `/ilan/${slug}`;
  return config.detailPathTemplate.replace('{slug}', slug);
}
