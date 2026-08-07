/**
 * Primary module keys for the GirisimBee ecosystem.
 * Maps 1:1 to PostgreSQL enum `marketplace_module_key`.
 */
export const MODULE_KEYS = [
  'entrepreneurs',
  'investors',
  'candidates',
  'employers',
  'founders',
  'franchise',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

/** Category slug → module key */
export const CATEGORY_SLUG_TO_MODULE: Record<string, ModuleKey> = {
  'yatirim-bul': 'entrepreneurs',
  'yatirim-yap': 'investors',
  'is-bul': 'candidates',
  'ise-al': 'employers',
  'ortak-bul': 'founders',
  franchise: 'franchise',
};

/** Franchise subcategory slugs */
export const FRANCHISE_SUBCATEGORY_SLUGS = ['franchise-buy', 'franchise-give'] as const;
export type FranchiseSubcategorySlug = (typeof FRANCHISE_SUBCATEGORY_SLUGS)[number];

/** Modules that use match workflow (not application) */
export const MATCH_MODULES: readonly ModuleKey[] = ['entrepreneurs', 'investors', 'founders'];

/** Modules that use application workflow */
export const APPLICATION_MODULES: readonly ModuleKey[] = ['candidates', 'employers', 'franchise'];

export function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value);
}

export function moduleKeyFromCategorySlug(slug: string): ModuleKey | null {
  return CATEGORY_SLUG_TO_MODULE[slug] ?? null;
}
