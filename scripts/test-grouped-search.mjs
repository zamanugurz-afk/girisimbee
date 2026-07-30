import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

register(
  pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'test-import-hook.mjs')).href,
  import.meta.url,
);

const { searchGroupedProductGroups, groupedProductMatchesSearchQuery } = await import(
  pathToFileURL(join(projectRoot, 'lib/engines/search-engine.ts')).href
);
const { groupListingsByProduct } = await import(
  pathToFileURL(join(projectRoot, 'lib/engines/product-matching-engine.ts')).href
);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${message}`);
  }
}

function mockListing(id, title, intel, provider) {
  return {
    id,
    provider_id: provider.id,
    product_id: `product-${id}`,
    external_listing_id: `${provider.slug}-${id}`,
    title,
    description: null,
    url: `https://example.com/${id}`,
    source_url: `https://example.com/${id}`,
    image_urls: [],
    price: 10000,
    previous_price: null,
    currency: 'TRY',
    district: 'Kadikoy',
    city: 'Istanbul',
    listing_date: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    condition: 'good',
    product_family: intel.product_family ?? null,
    edition: intel.edition ?? 'DISC',
    storage: intel.storage ?? 'UNKNOWN',
    brand: intel.brand ?? null,
    platform: intel.platform ?? null,
    generation: intel.generation ?? null,
    model: intel.model ?? null,
    color: null,
    item_condition: 'USED',
    bundle_type: 'CONSOLE_ONLY',
    is_bundle: false,
    seller_id: null,
    is_active: true,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    provider,
    product: null,
    seller: null,
  };
}

const sahibinden = { id: 'p1', slug: 'sahibinden', name: 'Sahibinden' };
const letgo = { id: 'p2', slug: 'letgo', name: 'Letgo' };

const listings = [
  mockListing('slim-1', 'PlayStation 5 Slim 1TB', {
    product_family: null,
    generation: 'PS5',
    model: 'SLIM',
    platform: 'PLAYSTATION',
    brand: 'SONY',
  }, sahibinden),
  mockListing('slim-2', 'PS5 Slim Digital', {
    product_family: null,
    generation: 'PS5',
    model: 'SLIM',
    platform: 'PLAYSTATION',
    brand: 'SONY',
    edition: 'DIGITAL',
  }, letgo),
  mockListing('pro-1', 'PlayStation 5 Pro', {
    product_family: null,
    generation: 'PS5_PRO',
    model: 'PRO',
    platform: 'PLAYSTATION',
    brand: 'SONY',
  }, sahibinden),
  mockListing('ps5-1', 'Sony PlayStation 5', {
    product_family: null,
    generation: 'PS5',
    model: 'BASE',
    platform: 'PLAYSTATION',
    brand: 'SONY',
  }, letgo),
  mockListing('xsx-1', 'Xbox Series X 1TB', {
    product_family: null,
    generation: 'SERIES_X',
    model: 'STANDARD',
    platform: 'XBOX',
    brand: 'MICROSOFT',
  }, sahibinden),
  mockListing('xss-1', 'Microsoft Xbox Series S', {
    product_family: null,
    generation: 'SERIES_S',
    model: 'STANDARD',
    platform: 'XBOX',
    brand: 'MICROSOFT',
  }, letgo),
];

const allGroups = groupListingsByProduct(listings);

function familiesForQuery(query) {
  return searchGroupedProductGroups(query, listings).map((group) => group.product_family);
}

assert(familiesForQuery('PS5 Slim').includes('PS5_SLIM'), 'PS5 Slim search');
assert(familiesForQuery('PS5 Pro').includes('PS5_PRO'), 'PS5 Pro search');
assert(familiesForQuery('PS5').includes('PS5'), 'PS5 search');
assert(familiesForQuery('PS5').includes('PS5_SLIM'), 'PS5 search includes slim');
assert(familiesForQuery('PS5').includes('PS5_PRO'), 'PS5 search includes pro');
assert(!familiesForQuery('PS5 Slim').includes('PS5_PRO'), 'PS5 Slim excludes pro');
assert(familiesForQuery('Xbox Series X').includes('XBOX_SERIES_X'), 'Xbox Series X search');
assert(familiesForQuery('Xbox Series S').includes('XBOX_SERIES_S'), 'Xbox Series S search');

const slimGroup = allGroups.find((group) => group.product_family === 'PS5_SLIM');
assert(Boolean(slimGroup), 'slim group exists');
if (slimGroup) {
  assert(groupedProductMatchesSearchQuery(slimGroup, 'PS5 Slim'), 'group matcher PS5 Slim');
  assert(!groupedProductMatchesSearchQuery(slimGroup, 'PS5 Pro'), 'group matcher excludes PS5 Pro');
}

console.log(`Grouped search tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
