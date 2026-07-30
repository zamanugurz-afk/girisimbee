import { analyzeProduct } from '../lib/product-analyzer.ts';

const CASES = [
  [
    'Sony PlayStation 5 Slim Disc 1TB',
    {
      brand: 'SONY',
      platform: 'PLAYSTATION',
      generation: 'PS5',
      model: 'SLIM',
      edition: 'DISC',
      storage: '1TB',
      family: 'CONSOLE',
      product_family: 'PS5_SLIM',
    },
  ],
  [
    'Sony PS5 Pro',
    {
      brand: 'SONY',
      platform: 'PLAYSTATION',
      generation: 'PS5_PRO',
      model: 'PRO',
      family: 'CONSOLE',
      product_family: 'PS5_PRO',
    },
  ],
  [
    'Xbox Series X 1TB',
    {
      platform: 'XBOX',
      generation: 'SERIES_X',
      storage: '1TB',
      family: 'CONSOLE',
      product_family: 'XBOX_SERIES_X',
    },
  ],
  [
    'Xbox Series S 512GB',
    {
      platform: 'XBOX',
      generation: 'SERIES_S',
      storage: '512GB',
      family: 'CONSOLE',
      product_family: 'XBOX_SERIES_S',
    },
  ],
  [
    'Sony DualSense Midnight Black',
    {
      brand: 'SONY',
      family: 'CONTROLLER',
      generation: 'DUALSENSE',
      color: 'BLACK',
      product_family: 'DUALSENSE',
    },
  ],
  [
    'Sony PS5',
    {
      brand: 'SONY',
      platform: 'PLAYSTATION',
      generation: 'PS5',
      model: 'BASE',
      family: 'CONSOLE',
      product_family: 'PS5',
    },
  ],
  [
    'Playstation 5',
    {
      platform: 'PLAYSTATION',
      generation: 'PS5',
      model: 'BASE',
      family: 'CONSOLE',
      product_family: 'PS5',
    },
  ],
];

let passed = 0;
let failed = 0;

for (const [title, expected] of CASES) {
  const result = analyzeProduct(title);
  if (!result) {
    failed += 1;
    console.error(`FAIL null: "${title}"`);
    continue;
  }

  let ok = true;
  for (const [key, value] of Object.entries(expected)) {
    if (result[key] !== value) {
      ok = false;
      console.error(`FAIL "${title}" ${key}: expected ${value}, got ${result[key]}`);
    }
  }

  if (ok) passed += 1;
  else failed += 1;
}

console.log(`Product analyzer tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
