import {
  normalizeProduct,
  SUPPORTED_PRODUCT_FAMILIES,
} from '../lib/product-normalizer.ts';
import { listingMatchesSearchQuery } from '../lib/product-classifier.ts';

const NORMALIZE_CASES = [
  ['Sony Playstation 5', { product_family: 'PS5', edition: 'UNKNOWN' }],
  ['Sony PS5', { product_family: 'PS5', edition: 'UNKNOWN' }],
  ['PS5 Diskli', { product_family: 'PS5', edition: 'DISC' }],
  ['Playstation 5 Slim', { product_family: 'PS5_SLIM', edition: 'UNKNOWN' }],
  ['PS5 Slim Dijital', { product_family: 'PS5_SLIM', edition: 'DIGITAL' }],
  ['PS5 Pro', { product_family: 'PS5_PRO', edition: 'UNKNOWN' }],
  ['DualSense Midnight Black', { product_family: 'DUALSENSE', edition: 'UNKNOWN' }],
  ['Xbox Elite Wireless Controller Series 2', { product_family: 'XBOX_ELITE_SERIES_2', edition: 'UNKNOWN' }],
  ['PS5 825GB Sifir Kapali Kutu', { product_family: 'PS5', storage: '825GB', condition: 'NEW' }],
  ['PS5 1TB Az Kullanilmis', { product_family: 'PS5', storage: '1TB', condition: 'LIKE_NEW' }],
  ['PS5 2.el Ikinci El', { product_family: 'PS5', condition: 'USED' }],
];

const SEARCH_CASES = [
  { query: 'PS5', family: 'PS5', slug: 'playstation-5', expect: true },
  { query: 'PS5', family: 'PS5_SLIM', slug: 'playstation-5-slim', expect: false },
  { query: 'PS5', family: 'PS5_PRO', slug: 'playstation-5-pro', expect: false },
  { query: 'PS5', family: 'XBOX_SERIES_X', slug: 'xbox-series-x', expect: false },
  { query: 'PS5 Slim', family: 'PS5_SLIM', slug: 'playstation-5-slim', expect: true },
  { query: 'PS5 Slim', family: 'PS5', slug: 'playstation-5', expect: false },
  { query: 'DualSense', family: 'DUALSENSE', slug: 'dualsense', expect: true },
  { query: 'DualSense', family: 'PS5', slug: 'playstation-5', expect: false },
];

let passed = 0;
let failed = 0;

for (const [title, expected] of NORMALIZE_CASES) {
  const result = normalizeProduct(title);
  if (!result) {
    failed += 1;
    console.error(`FAIL normalize null: "${title}"`);
    continue;
  }

  let ok = true;
  for (const [key, value] of Object.entries(expected)) {
    if (result[key] !== value) {
      ok = false;
      console.error(
        `FAIL normalize: "${title}" ${key} expected ${value}, got ${result[key]}`,
      );
    }
  }

  if (ok) passed += 1;
  else failed += 1;
}

for (const { query, family, slug, expect } of SEARCH_CASES) {
  const title = `${query} listing`;
  const match = listingMatchesSearchQuery(title, slug, query, family);
  if (match === expect) {
    passed += 1;
  } else {
    failed += 1;
    console.error(
      `FAIL search: query="${query}" family=${family} expected ${expect}, got ${match}`,
    );
  }
}

console.log(`Product normalizer tests: ${passed} passed, ${failed} failed`);
console.log(`Supported families (${SUPPORTED_PRODUCT_FAMILIES.length}):`, SUPPORTED_PRODUCT_FAMILIES.join(', '));
process.exit(failed > 0 ? 1 : 0);
