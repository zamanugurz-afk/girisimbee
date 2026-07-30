/**
 * Bootstrap live Dolap + Letgo data:
 * 1. Disable Sahibinden provider
 * 2. Delete fake/invalid listings
 * 3. Run production sync for Letgo and Dolap
 *
 * Usage: npx tsx scripts/bootstrap-live-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const { auditStoredListing } = await import(
  pathToFileURL(path.join(projectRoot, 'lib/listing-url-validator.ts')).href
);

console.log('Step 1: Disable inactive providers...');
await supabase
  .from('providers')
  .update({ is_enabled: false, updated_at: new Date().toISOString() })
  .in('slug', ['sahibinden', 'facebook-marketplace', 'gardrops']);

const { data: sahibindenProvider } = await supabase
  .from('providers')
  .select('id')
  .eq('slug', 'sahibinden')
  .maybeSingle();

if (sahibindenProvider?.id) {
  await supabase
    .from('listings')
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq('provider_id', sahibindenProvider.id);
}

console.log('Step 2: Audit and delete invalid listings...');
let rows = null;
let fetchError = null;

{
  const result = await supabase
    .from('listings')
    .select(`
      id,
      external_listing_id,
      url,
      source_url,
      provider:providers(slug)
    `);
  rows = result.data;
  fetchError = result.error;
}

if (fetchError?.message?.includes('source_url')) {
  const fallback = await supabase
    .from('listings')
    .select(`
      id,
      external_listing_id,
      url,
      provider:providers(slug)
    `);
  rows = (fallback.data ?? []).map((row) => ({ ...row, source_url: row.url }));
  fetchError = fallback.error;
}

if (fetchError) {
  console.error('Failed to fetch listings:', fetchError.message);
  process.exit(1);
}

const invalidIds = [];
for (const row of rows ?? []) {
  const validation = auditStoredListing({
    provider_slug: row.provider?.slug,
    external_listing_id: row.external_listing_id,
    url: row.url,
    source_url: row.source_url,
  });
  if (!validation.valid) invalidIds.push(row.id);
}

if (invalidIds.length > 0) {
  for (let i = 0; i < invalidIds.length; i += 100) {
    const chunk = invalidIds.slice(i, i + 100);
    const { error: deleteError } = await supabase.from('listings').delete().in('id', chunk);
    if (deleteError) {
      console.error('Delete failed:', deleteError.message);
      process.exit(1);
    }
  }
  console.log(`Deleted ${invalidIds.length} invalid listings.`);
} else {
  console.log('No invalid listings to delete.');
}

console.log('Step 3: Sync Letgo + Dolap...');
const { SyncService } = await import(pathToFileURL(path.join(projectRoot, 'services/sync-service.ts')).href);
const { ALL_PROVIDERS } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/index.ts')).href
);
const { closeBrowserFetchPool } = await import(
  pathToFileURL(path.join(projectRoot, 'services/providers/marketplace-browser-fetch.server.ts')).href
);

const sync = new SyncService(ALL_PROVIDERS);

const result = { status: 'success', total_found: 0, total_imported: 0, total_updated: 0, total_failed: 0 };
for (const slug of ['letgo', 'dolap']) {
  console.log(`  syncing ${slug}...`);
  const one = await sync.runSync([], 10, slug);
  result.total_found += one.total_found ?? 0;
  result.total_imported += one.total_imported ?? 0;
  result.total_updated += one.total_updated ?? 0;
  result.total_failed += one.total_failed ?? 0;
  if (one.error_summary) console.log(`    ${slug} errors:`, one.error_summary);
}

if (result.total_failed > 0) result.status = 'partial';

console.log('\nSync result:');
console.log('  status:', result.status);
console.log('  found:', result.total_found);
console.log('  imported:', result.total_imported);
console.log('  updated:', result.total_updated);
console.log('  failed:', result.total_failed);

await closeBrowserFetchPool();

console.log('\nStep 4: Active listing counts by provider...');
for (const slug of ['letgo', 'dolap']) {
  const { data: provider } = await supabase.from('providers').select('id').eq('slug', slug).maybeSingle();
  if (!provider?.id) continue;

  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)
    .eq('is_active', true)
    .is('deleted_at', null);

  console.log(`  ${slug}: ${count ?? 0} active listings`);
}

console.log('\nBootstrap complete. Start the app with: npm run dev');
