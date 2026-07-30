import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

register(
  pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'test-import-hook.mjs')).href,
  import.meta.url,
);

const { validatePrimaryProduct } = await import(
  pathToFileURL(join(projectRoot, 'lib/engines/product-validation-engine.ts')).href
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

function expectCase(title, expectedType, options = {}) {
  const result = validatePrimaryProduct({
    title,
    description: options.description ?? null,
    marketplace_category: options.marketplace_category ?? null,
    marketplace_subcategory: options.marketplace_subcategory ?? null,
  });

  assert(
    result.primary_type === expectedType,
    `"${title}" expected ${expectedType}, got ${result.primary_type}`,
  );

  if (options.minConfidence != null) {
    assert(
      result.confidence >= options.minConfidence,
      `"${title}" confidence ${result.confidence} below ${options.minConfidence}`,
    );
  }

  if (options.accepted != null) {
    assert(
      result.accepted === options.accepted,
      `"${title}" accepted=${result.accepted}, expected ${options.accepted}`,
    );
  }

  if (options.rejectReasonIncludes) {
    assert(
      result.reject_reason.includes(options.rejectReasonIncludes),
      `"${title}" reject_reason="${result.reject_reason}" missing "${options.rejectReasonIncludes}"`,
    );
  }
}

expectCase('PS5 Slim Dijital', 'CONSOLE', { minConfidence: 90, accepted: true });
expectCase('DualSense Midnight Black', 'CONTROLLER', { minConfidence: 90, accepted: false, rejectReasonIncludes: 'CONTROLLER' });
expectCase('FC26 PS5', 'GAME', { minConfidence: 90, accepted: false, rejectReasonIncludes: 'GAME' });
expectCase('PS5 Slim + FC26', 'BUNDLE', { minConfidence: 90, accepted: false, rejectReasonIncludes: 'BUNDLE' });
expectCase('PS5 Hesabı', 'ACCOUNT', { accepted: false, rejectReasonIncludes: 'ACCOUNT' });
expectCase('PlayStation Plus Deluxe', 'SUBSCRIPTION', { accepted: false, rejectReasonIncludes: 'SUBSCRIPTION' });

expectCase('PS5 Slim', 'CONSOLE', { accepted: true });
expectCase('Xbox Series X', 'CONSOLE', { accepted: true });
expectCase('PS5 + DualSense', 'BUNDLE', { accepted: false, rejectReasonIncludes: 'BUNDLE' });
expectCase('Xbox Series X + Game Pass', 'BUNDLE', { accepted: false, rejectReasonIncludes: 'BUNDLE' });
expectCase('PS5 + SSD', 'BUNDLE', { accepted: false, rejectReasonIncludes: 'BUNDLE' });
expectCase('Sony DualSense White', 'CONTROLLER', { accepted: false, rejectReasonIncludes: 'CONTROLLER' });

const categoryBoost = validatePrimaryProduct({
  title: 'Temiz cihaz',
  description: 'Az kullanıldı',
  marketplace_category: 'Oyun Konsolu',
  marketplace_subcategory: 'PlayStation',
});
assert(categoryBoost.scores.console > 0, 'marketplace category should boost console score');

console.log(`Product validation tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
