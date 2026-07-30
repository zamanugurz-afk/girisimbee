import { getBundleRejection } from '../lib/bundle-detection-engine.ts';
import { classifyListingTitle, getListingRejectionReason } from '../lib/product-classifier.ts';

const REJECT_CASES = [
  ['PS5 Slim + FC26', 'PS5_SLIM'],
  ['PS5 Slim + DualSense', 'PS5_SLIM'],
  ['PS5 Slim + 2 Controllers', 'PS5_SLIM'],
  ['PS5 Bundle', 'PS5'],
  ['Xbox Series X + Game Pass', 'XBOX_SERIES_X'],
  ['Xbox + Headset', 'XBOX_SERIES_X'],
  ['PS5 Slim + Oyun + Kol', 'PS5_SLIM'],
];

const ACCEPT_CASES = [
  'PS5 Slim',
  'PS5 Pro',
  'Xbox Series X',
  'Xbox Series S',
  'Sony DualSense White',
];

let passed = 0;
let failed = 0;

for (const [title, category] of REJECT_CASES) {
  const rejection = getBundleRejection(title, category);
  const classified = classifyListingTitle(title);
  const reason = getListingRejectionReason(title);

  if (!rejection.reject) {
    failed += 1;
    console.error(`FAIL reject engine: "${title}" should be rejected`);
  } else if (classified !== null) {
    failed += 1;
    console.error(`FAIL reject classify: "${title}" classified as ${classified}`);
  } else if (!reason) {
    failed += 1;
    console.error(`FAIL reject reason: "${title}" has no rejection reason`);
  } else {
    passed += 1;
  }
}

for (const title of ACCEPT_CASES) {
  const classified = classifyListingTitle(title);
  const reason = getListingRejectionReason(title);

  if (!classified || reason) {
    failed += 1;
    console.error(`FAIL accept: "${title}" classified=${classified} reason=${reason}`);
  } else {
    passed += 1;
  }
}

console.log(`Bundle rejection tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
