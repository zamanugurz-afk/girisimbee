import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

register(
  pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'test-import-hook.mjs')).href,
  import.meta.url,
);

const { canReNotifyAlert, dealQualityScoreFromPercentage } = await import(
  pathToFileURL(join(projectRoot, 'lib/engines/price-alert-matching.ts')).href
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

assert(dealQualityScoreFromPercentage(-10) === 90, 'excellent deal quality score');
assert(dealQualityScoreFromPercentage(-5) === 75, 'good deal quality score');
assert(dealQualityScoreFromPercentage(0) === 55, 'fair deal quality score');
assert(dealQualityScoreFromPercentage(5) === 35, 'expensive deal quality score');
assert(dealQualityScoreFromPercentage(10) === 15, 'overpriced deal quality score');

const freshAlert = {
  id: 'a1',
  group_id: 'PS5_SLIM|DISC|1TB',
  label: null,
  max_price: 25000,
  min_deal_score: 70,
  min_trust_score: 60,
  notify_once: true,
  notify_again_after_days: 0,
  is_active: true,
  last_triggered_at: null,
  last_matched_listing_id: null,
  trigger_count: 0,
  created_at: '2026-07-28T00:00:00.000Z',
  updated_at: '2026-07-28T00:00:00.000Z',
};

assert(canReNotifyAlert(freshAlert), 'fresh alert can notify');

const notifyOnceTriggered = {
  ...freshAlert,
  last_triggered_at: '2026-07-27T00:00:00.000Z',
  trigger_count: 1,
};

assert(!canReNotifyAlert(notifyOnceTriggered), 'notify once blocks repeat');

const cooldownAlert = {
  ...freshAlert,
  notify_once: true,
  notify_again_after_days: 7,
  last_triggered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  trigger_count: 1,
};

assert(!canReNotifyAlert(cooldownAlert), 'cooldown not elapsed');

const cooldownReady = {
  ...cooldownAlert,
  last_triggered_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
};

assert(canReNotifyAlert(cooldownReady), 'cooldown elapsed allows notify');

const repeatEverySync = {
  ...freshAlert,
  notify_once: false,
  notify_again_after_days: 0,
  last_triggered_at: '2026-07-27T00:00:00.000Z',
  trigger_count: 3,
};

assert(canReNotifyAlert(repeatEverySync), 'repeat every sync when notify_once false');

console.log(`Price alert tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
