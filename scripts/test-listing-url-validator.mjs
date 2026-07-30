/*
  Validates marketplace URL rules and ingest completeness checks.
*/

import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

register(
  pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'test-import-hook.mjs')).href,
  import.meta.url,
);

const {
  validateMarketplaceListingUrl,
  validateRawListingForIngest,
  isOpenableMarketplaceUrl,
} = await import(pathToFileURL(join(projectRoot, 'lib/listing-url-validator.ts')).href);

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

assert(
  validateMarketplaceListingUrl(
    'sahibinden',
    'https://www.sahibinden.com/ilan/playstation-5-slim-1234567890/detay',
    '1234567890',
  ).valid,
  'valid sahibinden url',
);

assert(
  !validateMarketplaceListingUrl(
    'sahibinden',
    'https://www.sahibinden.com/ilan/listing-1',
    'listing-1',
  ).valid,
  'reject placeholder sahibinden url',
);

assert(
  validateMarketplaceListingUrl(
    'letgo',
    'https://www.letgo.com/item/ps5-slim-iid-998877',
    '998877',
  ).valid,
  'valid letgo url',
);

assert(
  validateMarketplaceListingUrl(
    'dolap',
    'https://dolap.com/urun/ps5-slim-disc-445566',
    '445566',
  ).valid,
  'valid dolap url',
);

assert(
  !validateMarketplaceListingUrl(
    'dolap',
    'https://dolap.com/urun/ps5-slim-disc-445566',
    '999999',
  ).valid,
  'reject dolap id mismatch',
);

assert(
  validateRawListingForIngest(
    {
      externalId: '123',
      title: 'PlayStation 5 Slim',
      price: 25000,
      currency: 'TRY',
      url: 'https://www.sahibinden.com/ilan/playstation-5-slim-123/detay',
      imageUrls: ['https://images.sahibinden.com/a.jpg'],
      district: 'Kadikoy',
      sellerName: 'Ali V.',
    },
    'sahibinden',
  ).accepted,
  'accept complete raw listing',
);

assert(
  !validateRawListingForIngest(
    {
      externalId: '123',
      title: 'PlayStation 5 Slim',
      price: 25000,
      currency: 'TRY',
      url: 'https://www.sahibinden.com/ilan/playstation-5-slim-123/detay',
      imageUrls: [],
      district: 'Kadikoy',
      sellerName: 'Ali V.',
    },
    'sahibinden',
  ).accepted,
  'reject listing without images',
);

assert(
  isOpenableMarketplaceUrl('https://www.letgo.com/item/ps5-slim-iid-998877'),
  'openable letgo url',
);

assert(
  !isOpenableMarketplaceUrl('https://www.sahibinden.com/ilan/listing-1'),
  'non-openable placeholder url',
);

console.log(`Listing URL validator tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
