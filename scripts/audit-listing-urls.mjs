/*
  Listing URL audit — reports invalid marketplace links and optionally marks them.

  Usage:
    node scripts/audit-listing-urls.mjs
    node scripts/audit-listing-urls.mjs --mark
    node scripts/audit-listing-urls.mjs --delete-invalid
    node scripts/audit-listing-urls.mjs --check-http
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function loadEnvFile(relativePath) {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const markInvalid = process.argv.includes('--mark');
const deleteInvalid = process.argv.includes('--delete-invalid');
const checkHttp = process.argv.includes('--check-http');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in env.');
  process.exit(1);
}

const { auditStoredListing } = await import(
  pathToFileURL(path.join(projectRoot, 'lib/listing-url-validator.ts')).href
);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrlStatus(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);
    return response.status;
  } catch {
    return 0;
  }
}

let rows = null;
let error = null;

{
  const result = await supabase
    .from('listings')
    .select(`
      id,
      title,
      external_listing_id,
      url,
      source_url,
      source_url_status,
      source_url_issue,
      is_active,
      provider:providers(slug, name)
    `)
    .order('created_at', { ascending: false });

  rows = result.data;
  error = result.error;
}

let canMark = true;

if (error?.message?.includes('source_url_status') || error?.message?.includes('source_url')) {
  const fallback = await supabase
    .from('listings')
    .select(`
      id,
      title,
      external_listing_id,
      url,
      is_active,
      provider:providers(slug, name)
    `)
    .order('created_at', { ascending: false });

  rows = (fallback.data ?? []).map((row) => ({
    ...row,
    source_url: row.url,
    source_url_status: 'unchecked',
    source_url_issue: null,
  }));
  error = fallback.error;
  if (!error) {
    canMark = false;
    console.warn('Audit running without source_url_status columns. Apply latest migrations to enable marking.');
    if (markInvalid) {
      console.warn('Skipping --mark because reliability columns are not available yet.');
    }
  }
}

if (error) {
  console.error('Failed to fetch listings:', error.message);
  process.exit(1);
}

const listingRows = rows ?? [];
const report = {
  generated_at: new Date().toISOString(),
  total: listingRows.length,
  valid: 0,
  invalid: 0,
  by_issue: {},
  by_provider: {},
  invalid_listings: [],
};

const invalidIds = [];

for (const row of listingRows) {
  const providerSlug = row.provider?.slug ?? 'unknown';
  report.by_provider[providerSlug] ??= { total: 0, invalid: 0 };
  report.by_provider[providerSlug].total += 1;

  const validation = auditStoredListing({
    provider_slug: providerSlug,
    external_listing_id: row.external_listing_id,
    url: row.url,
    source_url: row.source_url,
  });

  let issue = validation.valid ? null : validation.issue ?? 'invalid_source_url';
  let httpStatus = null;

  const sourceUrl = row.source_url?.trim() || row.url?.trim() || '';
  if (validation.valid && checkHttp && sourceUrl) {
    httpStatus = await checkUrlStatus(sourceUrl);
    if (httpStatus === 404) {
      issue = 'http_404';
    }
  }

  if (!issue) {
    report.valid += 1;
    if (markInvalid && canMark && row.source_url_status !== 'valid') {
      await supabase
        .from('listings')
        .update({ source_url_status: 'valid', source_url_issue: null })
        .eq('id', row.id);
    }
    continue;
  }

  report.invalid += 1;
  report.by_provider[providerSlug].invalid += 1;
  report.by_issue[issue] = (report.by_issue[issue] ?? 0) + 1;

  report.invalid_listings.push({
    id: row.id,
    provider: providerSlug,
    title: row.title,
    external_listing_id: row.external_listing_id,
    source_url: sourceUrl,
    issue,
    http_status: httpStatus,
    is_active: row.is_active,
  });

  invalidIds.push(row.id);

  if (markInvalid && canMark) {
    await supabase
      .from('listings')
      .update({
        source_url_status: 'invalid',
        source_url_issue: issue,
      })
      .eq('id', row.id);
  }
}

if (deleteInvalid && invalidIds.length > 0) {
  let deleted = 0;
  for (let i = 0; i < invalidIds.length; i += 100) {
    const chunk = invalidIds.slice(i, i + 100);
    const { error: deleteError } = await supabase.from('listings').delete().in('id', chunk);
    if (deleteError) {
      console.error('Failed to delete invalid listings:', deleteError.message);
      process.exit(1);
    }
    deleted += chunk.length;
  }
  console.log(`Deleted ${deleted} invalid listings from database.`);
}

const reportDir = path.join(projectRoot, 'reports');
fs.mkdirSync(reportDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const jsonPath = path.join(reportDir, `listing-url-audit-${stamp}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

console.log('Listing URL audit complete');
console.log(`Total listings: ${report.total}`);
console.log(`Valid: ${report.valid}`);
console.log(`Invalid: ${report.invalid}`);
console.log('Issues:', report.by_issue);
console.log('By provider:', report.by_provider);
console.log(`Report saved to ${jsonPath}`);

if (markInvalid && canMark) {
  console.log('Invalid listings were marked in source_url_status/source_url_issue.');
}

process.exit(report.invalid > 0 ? 2 : 0);
