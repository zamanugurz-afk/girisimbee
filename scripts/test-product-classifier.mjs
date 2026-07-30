import {
  classifyListingTitle,
  getClassifierStats,
  getListingRejectionReason,
} from '../lib/product-classifier.ts';

const ACCEPT_CASES = [
  ['Sony PlayStation 5 Console', 'PS5'],
  ['PlayStation 5 Slim 1TB', 'PS5_SLIM'],
  ['PS5 Pro Digital Edition', 'PS5_PRO'],
  ['Microsoft Xbox Series X 1TB', 'XBOX_SERIES_X'],
  ['Xbox Series S 512GB', 'XBOX_SERIES_S'],
  ['Sony DualSense White', 'DUALSENSE'],
  ['DualSense Edge PS5 Controller', 'DUALSENSE_EDGE'],
  ['Xbox Wireless Controller Series Carbon Black', 'XBOX_CONTROLLER'],
  ['Xbox Elite Wireless Controller Series 2', 'XBOX_ELITE_SERIES_2'],
];

const REJECT_CASES = [
  '16 ADET TEMİZ TOPTAN PS4 OYUNLAR',
  'FIFA 24 PS5 Oyun',
  'PS5 + Spider-Man bundle',
  'PlayStation 5 + DualSense set',
  'PS5 Slim + FC26',
  'PS5 Bundle',
  'Xbox + Headset',
  'PS4 Slim 500GB',
  'Xbox One S 1TB',
  'DualShock 4 Controller',
  'PS5 Headset Kulaklık',
  'Xbox Series X Stand',
  'God of War PS5 Game',
];

let passed = 0;
let failed = 0;

for (const [title, expected] of ACCEPT_CASES) {
  const category = classifyListingTitle(title);
  if (category === expected) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL accept: "${title}" expected ${expected}, got ${category}`);
  }
}

for (const title of REJECT_CASES) {
  const category = classifyListingTitle(title);
  const reason = getListingRejectionReason(title);
  if (category === null && reason) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL reject: "${title}" classified as ${category}, reason=${reason}`);
  }
}

const stats = getClassifierStats();
console.log('\nClassifier stats:', JSON.stringify(stats, null, 2));
console.log(`\nTests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
