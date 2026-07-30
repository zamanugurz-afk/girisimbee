import { buildGroupedPriceSnapshots } from '../lib/engines/grouped-price-history-engine.ts';
import { resolveGroupedPriceHistoryStartDate } from '../lib/services/grouped-product-price-history-service.ts';

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

const mockGroups = [
  {
    id: 'PS5_SLIM|DISC|1TB',
    product_family: 'PS5_SLIM',
    edition: 'DISC',
    storage: '1TB',
    label: 'PS5 Slim Disc 1TB',
    listing_count: 3,
    lowest_price: 22000,
    highest_price: 26000,
    average_price: 24000,
    providers: [],
    listing_ids: ['a', 'b', 'c'],
  },
];

const snapshots = buildGroupedPriceSnapshots(mockGroups, '2026-07-28');
assert(snapshots.length === 1, 'should build one snapshot');
assert(snapshots[0]?.lowest_price === 22000, 'snapshot lowest price');
assert(snapshots[0]?.average_price === 24000, 'snapshot average price');
assert(snapshots[0]?.highest_price === 26000, 'snapshot highest price');
assert(snapshots[0]?.listing_count === 3, 'snapshot listing count');
assert(snapshots[0]?.group_id === 'PS5_SLIM|DISC|1TB', 'snapshot group id');

assert(resolveGroupedPriceHistoryStartDate('7d') != null, '7d start date');
assert(resolveGroupedPriceHistoryStartDate('30d') != null, '30d start date');
assert(resolveGroupedPriceHistoryStartDate('90d') != null, '90d start date');
assert(resolveGroupedPriceHistoryStartDate('all') === null, 'all time start date');

console.log(`Grouped price history tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
