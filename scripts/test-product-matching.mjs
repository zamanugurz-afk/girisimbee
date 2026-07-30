import {
  buildProductMatchKey,
  groupListingsByProduct,
  searchGroupedProducts,
} from '../lib/engines/product-matching-engine.ts';

function mockListing(
  id: string,
  title: string,
  price: number,
  intel: { product_family: string; edition?: string; storage?: string },
  provider: { id: string; slug: string; name: string },
) {
  return {
    id,
    provider_id: provider.id,
    product_id: `product-${intel.product_family}`,
    external_listing_id: `${provider.slug}-${id}`,
    title,
    description: null,
    url: `https://example.com/${id}`,
    source_url: `https://example.com/${id}`,
    image_urls: [],
    price,
    previous_price: null,
    currency: 'TRY',
    district: 'Kadikoy',
    city: 'Istanbul',
    listing_date: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    condition: 'good',
    product_family: intel.product_family,
    edition: intel.edition ?? 'UNKNOWN',
    storage: intel.storage ?? 'UNKNOWN',
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
const dolap = { id: 'p3', slug: 'dolap', name: 'Dolap' };

const slimListings = [
  mockListing('1', 'PS5 Slim Diskli', 25000, { product_family: 'PS5_SLIM', edition: 'DISC' }, sahibinden),
  mockListing('2', 'PlayStation 5 Slim', 24500, { product_family: 'PS5_SLIM' }, letgo),
  mockListing('3', 'Sony PS5 Slim', 26000, { product_family: 'PS5_SLIM' }, dolap),
];

const dualsenseListings = [
  mockListing('4', 'DualSense Midnight Black', 2200, { product_family: 'DUALSENSE' }, sahibinden),
  mockListing('5', 'Sony DualSense', 2100, { product_family: 'DUALSENSE' }, letgo),
];

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${message}`);
  }
}

const slimGroups = groupListingsByProduct(slimListings);
assert(slimGroups.length === 1, `expected 1 PS5 Slim group, got ${slimGroups.length}`);
assert(slimGroups[0]?.listing_count === 3, 'PS5 Slim group should contain 3 listings');
assert(slimGroups[0]?.lowest_price === 24500, 'lowest price should be 24500');
assert(slimGroups[0]?.highest_price === 26000, 'highest price should be 26000');
assert(slimGroups[0]?.providers.length === 3, 'group should list 3 providers');

const controllerGroups = groupListingsByProduct(dualsenseListings);
assert(controllerGroups.length === 1, `expected 1 DualSense group, got ${controllerGroups.length}`);
assert(controllerGroups[0]?.listing_count === 2, 'DualSense group should contain 2 listings');

const sameKey = buildProductMatchKey({
  product_family: 'PS5_SLIM',
  edition: 'DISC',
  storage: 'UNKNOWN',
});
const unknownKey = buildProductMatchKey({
  product_family: 'PS5_SLIM',
  edition: 'UNKNOWN',
  storage: 'UNKNOWN',
});
assert(sameKey === unknownKey, 'DISC and UNKNOWN edition should share match key for Slim');

const digitalSplit = groupListingsByProduct([
  mockListing('6', 'PS5 Slim Dijital', 23000, { product_family: 'PS5_SLIM', edition: 'DIGITAL' }, sahibinden),
  ...slimListings,
]);
assert(digitalSplit.length === 2, 'DIGITAL Slim should split from disc/unknown Slim group');

const groupedSearch = searchGroupedProducts('PS5 Slim', slimListings);
assert(groupedSearch.groups.length === 1, 'search should return one grouped result for PS5 Slim');
assert(groupedSearch.total_listings === 3, 'search should match all 3 slim listings');

console.log(`Product matching tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
