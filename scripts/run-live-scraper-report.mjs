/*
  Live scraper report — real websites only, no DB writes, no fixtures.
  Usage: npx tsx scripts/run-live-scraper-report.mjs
*/

import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stub = path.join(projectRoot, 'scripts/server-only-stub.cjs');
const orig = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
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

const { searchSahibindenKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/sahibinden-fetch.server.ts')).href
);
const { searchLetgoKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/letgo-fetch.server.ts')).href
);
const { searchDolapKeywords } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/dolap-fetch.server.ts')).href
);

const KEYWORDS = ['PlayStation 5', 'ps5', 'Xbox Series X'];

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

function fieldOk(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every((v) => typeof v === 'string' && v.startsWith('http'));
  return Boolean(value);
}

const providers = [
  { label: 'SAHIBINDEN', search: () => searchSahibindenKeywords(KEYWORDS, 30) },
  { label: 'LETGO', search: () => searchLetgoKeywords(KEYWORDS, 30) },
  { label: 'DOLAP', search: () => searchDolapKeywords(KEYWORDS, 30) },
];

const summary = {};

for (const provider of providers) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(provider.label);
  console.log('='.repeat(60));

  let listings = [];
  let fetchError = null;
  try {
    listings = await provider.search();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  console.log(`Listings collected: ${listings.length}`);
  if (fetchError) console.log(`Fetch error: ${fetchError}`);

  const urls = listings.slice(0, 10).map((l) => l.url);
  if (urls.length === 0) {
    console.log('First 10 real URLs: (none)');
  } else {
    console.log('First 10 real URLs:');
    urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
  }

  for (let i = 0; i < Math.min(10, listings.length); i++) {
    const item = listings[i];
    const status = await httpStatus(item.url);
    console.log(`\n  URL #${i + 1}: ${item.url}`);
    console.log(`    HTTP: ${status}`);
    console.log(`    title: ${fieldOk(item.title) ? 'OK' : 'MISSING'} — ${item.title ?? ''}`);
    console.log(`    price: ${fieldOk(item.price) ? 'OK' : 'MISSING'} — ${item.price ?? ''}`);
    console.log(`    image: ${fieldOk(item.imageUrls) ? 'OK' : 'MISSING'} — ${item.imageUrls?.[0] ?? ''}`);
    console.log(`    marketplace id: ${item.externalId ?? ''}`);
    console.log(`    city: ${item.city ?? 'n/a'}`);
    console.log(`    district: ${item.district ?? 'n/a'}`);
    console.log(`    listing date: ${item.listingDate ?? 'n/a'}`);
  }

  const working =
    listings.length > 0 &&
    listings.slice(0, 10).every(
      (item) =>
        fieldOk(item.title) &&
        fieldOk(item.price) &&
        fieldOk(item.url) &&
        fieldOk(item.externalId) &&
        fieldOk(item.imageUrls),
    );

  summary[provider.label] = {
    working,
    count: listings.length,
    fetchError,
  };
}

console.log(`\n${'='.repeat(60)}`);
console.log('FINAL STATUS');
console.log('='.repeat(60));
for (const [label, result] of Object.entries(summary)) {
  const name = label.charAt(0) + label.slice(1).toLowerCase();
  console.log(`${result.working ? '✓' : '✗'} ${name}: ${result.working ? 'WORKING' : 'NOT WORKING'} (${result.count} listings)`);
  if (result.fetchError) console.log(`  error: ${result.fetchError}`);
}

const { closeBrowserFetchPool } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/marketplace-browser-fetch.server.ts')).href
);
await closeBrowserFetchPool();
