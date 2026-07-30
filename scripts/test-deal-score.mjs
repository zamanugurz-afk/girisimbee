import {
  attachDealScoresToGroups,
  resolveDealLabel,
  scoreGroupedProduct,
} from '../lib/engines/deal-score-engine.ts';

function mockGroup(id, family, prices, edition = 'DISC', storage = '1TB') {
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);

  return {
    id,
    product_family: family,
    edition,
    storage,
    label: `${family} ${edition} ${storage}`,
    listing_count: prices.length,
    lowest_price: lowest,
    highest_price: highest,
    average_price: average,
    providers: [{ id: 'p1', slug: 'sahibinden', name: 'Sahibinden' }],
    listing_ids: prices.map((_, index) => `${id}-listing-${index}`),
  };
}

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

function assertExample(name, prices, expectedLabel, expectedPct, contextGroups = []) {
  const group = mockGroup(name, 'PS5_SLIM', prices);
  const context = contextGroups.length > 0 ? contextGroups : [group];
  const score = scoreGroupedProduct(group, context);

  assert(score.market_average === 24000, `${name}: market_average should be 24000, got ${score.market_average}`);
  assert(score.lowest_price === Math.min(...prices), `${name}: lowest_price mismatch`);
  assert(score.average_price === group.average_price, `${name}: average_price mismatch`);
  assert(score.label === expectedLabel, `${name}: expected ${expectedLabel}, got ${score.label}`);

  if (expectedPct != null) {
    assert(
      score.deal_percentage === expectedPct,
      `${name}: expected ${expectedPct}%, got ${score.deal_percentage}%`,
    );
  }

  assert(score.confidence > 0, `${name}: confidence should be > 0`);
}

const referenceMarketGroup = mockGroup('reference', 'PS5_SLIM', [24000, 24000, 24000]);

assertExample('excellent-deal', [21500, 24500, 26000], 'excellent-deal', -10.4);
assertExample('good-deal', [23200, 24000, 24800], 'good-deal', -3.3);
assertExample('fair-price', [23900, 24000, 24100], 'fair-price', -0.4);

const overpricedGroup = mockGroup('overpriced', 'PS5_SLIM', [26000]);
const overpricedScore = scoreGroupedProduct(overpricedGroup, [referenceMarketGroup, overpricedGroup]);
assert(overpricedScore.market_average === 24000, 'overpriced: market_average should be 24000');
assert(overpricedScore.label === 'overpriced', `overpriced: expected overpriced, got ${overpricedScore.label}`);
assert(overpricedScore.deal_percentage === 8.3, `overpriced: expected 8.3%, got ${overpricedScore.deal_percentage}%`);

assert(resolveDealLabel(-10) === 'excellent-deal', 'resolveDealLabel(-10)');
assert(resolveDealLabel(-5) === 'good-deal', 'resolveDealLabel(-5)');
assert(resolveDealLabel(-1) === 'fair-price', 'resolveDealLabel(-1)');
assert(resolveDealLabel(4) === 'expensive', 'resolveDealLabel(4)');
assert(resolveDealLabel(8) === 'overpriced', 'resolveDealLabel(8)');

const scoredGroups = attachDealScoresToGroups(
  [overpricedGroup],
  [referenceMarketGroup, overpricedGroup],
);
assert(scoredGroups[0]?.deal_score?.label === 'overpriced', 'attachDealScoresToGroups should attach deal_score');

console.log(`Deal score tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
