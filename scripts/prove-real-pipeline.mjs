/*
  Read-only pipeline proof — no database writes.
  Usage: node scripts/prove-real-pipeline.mjs
*/

import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stub = path.join(projectRoot, 'scripts/server-only-stub.cjs');
const nodeModule = Module;
const orig = nodeModule._resolveFilename;
nodeModule._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'server-only') return stub;
  return orig.call(this, request, parent, isMain, options);
};

function loadEnv() {
  for (const rel of ['.env.local', '.env']) {
    const full = path.join(projectRoot, rel);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      if (!process.env[key]) process.env[key] = t.slice(i + 1).trim();
    }
  }
}

loadEnv();

const { SYNC_SEARCH_KEYWORDS } = await import(
  pathToFileURL(path.join(projectRoot, 'config/product-catalog.ts')).href
);
const { validateRawListingForIngest } = await import(
  pathToFileURL(path.join(projectRoot, 'lib/listing-url-validator.ts')).href
);
const { validatePrimaryProduct } = await import(
  pathToFileURL(path.join(projectRoot, 'lib/engines/product-validation-engine.ts')).href
);
const { classifyListingTitle, getProductSlugForCategory } = await import(
  pathToFileURL(path.join(projectRoot, 'lib/product-classifier.ts')).href
);
const { searchSahibindenKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/sahibinden-fetch.server.ts')).href
);
const { searchLetgoKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/letgo-fetch.server.ts')).href
);
const { searchDolapKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/dolap-fetch.server.ts')).href
);

const providers = [
  { name: 'Sahibinden', slug: 'sahibinden', search: searchSahibindenKeywords },
  { name: 'Letgo', slug: 'letgo', search: searchLetgoKeywords },
  { name: 'Dolap', slug: 'dolap', search: searchDolapKeywords },
];

async function httpStatus(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
    });
    clearTimeout(timer);
    return res.status;
  } catch (err) {
    return `ERR:${err instanceof Error ? err.message : String(err)}`;
  }
}

function toRaw(item) {
  return {
    externalId: item.externalId,
    title: item.title,
    price: item.price,
    url: item.url,
    imageUrls: item.imageUrls,
    district: item.district,
    city: item.city ?? 'Istanbul',
    sellerName: item.sellerName,
    description: item.description ?? null,
  };
}

function insertReadiness(raw, slug) {
  const ingest = validateRawListingForIngest(raw, slug);
  const product = validatePrimaryProduct({ title: raw.title, description: raw.description });
  const category = classifyListingTitle(raw.title);
  const productSlug = category ? getProductSlugForCategory(category) : null;
  return {
    insert_ok: ingest.accepted && product.accepted && Boolean(productSlug),
    ingest_ok: ingest.accepted,
    ingest_issues: ingest.issues,
    product_ok: product.accepted,
    product_issue: product.reject_reason ?? product.reasons?.[0] ?? null,
    category,
    product_slug: productSlug,
  };
}

for (const provider of providers) {
  console.log('\n========================================');
  console.log(`PROVIDER: ${provider.name}`);
  console.log('========================================');

  const collected = await provider.search(SYNC_SEARCH_KEYWORDS, 30);
  console.log(`1. Listings collected: ${collected.length}`);

  if (collected.length === 0) {
    console.log('FAIL: zero listings collected — stopping.');
    process.exit(1);
  }

  const ingestReady = collected.filter((item) =>
    validateRawListingForIngest(toRaw(item), provider.slug).accepted,
  );

  if (ingestReady.length < 5) {
    console.log(
      `FAIL: fewer than 5 ingest-valid listings (${ingestReady.length}/${collected.length}) — stopping.`,
    );
    process.exit(1);
  }

  const sample = ingestReady.slice(0, 5);

  console.log('2. Five marketplace URLs:');
  sample.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.url}`);
  });

  console.log('3. HTTP status checks:');
  for (let i = 0; i < sample.length; i++) {
    const status = await httpStatus(sample[i].url);
    console.log(`  ${i + 1}. HTTP ${status} — ${sample[i].url}`);
    if (status !== 200) {
      console.log('FAIL: not all URLs returned HTTP 200 — stopping.');
      process.exit(1);
    }
  }

  console.log('4. Insert readiness (dry-run, no DB write):');
  for (let i = 0; i < sample.length; i++) {
    const check = insertReadiness(toRaw(sample[i]), provider.slug);
    console.log(
      `  ${i + 1}. insert_ok=${check.insert_ok} ingest=${check.ingest_ok} product=${check.product_ok} slug=${check.product_slug ?? 'null'}`,
    );
    if (!check.insert_ok) {
      console.log(`      ingest_issues: ${check.ingest_issues.join(', ') || 'none'}`);
      console.log(`      product_issue: ${check.product_issue ?? 'none'}`);
      console.log('FAIL: not all sample listings pass insert validation — stopping.');
      process.exit(1);
    }
  }

  console.log(`PASS: ${provider.name}`);
}

console.log('\nAll providers passed pipeline proof (no database writes).');
