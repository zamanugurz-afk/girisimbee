/**
 * One-off Dolap sync runner — loads .env before Supabase client init.
 */
import fs from 'fs';
import path from 'path';
import Module from 'node:module';
import { fileURLToPath } from 'url';

const stubPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'server-only-stub.cjs');
type ResolveFilename = typeof Module & { _resolveFilename: (request: string, parent: NodeModule, isMain: boolean, options?: unknown) => string; };
const nodeModule = Module as ResolveFilename;
const originalResolveFilename = nodeModule._resolveFilename;
nodeModule._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'server-only') {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnv();

  const { SyncService } = await import('../services/sync-service');
  const { dolapProvider } = await import('../services/providers/dolap');
  const { supabase } = await import('../lib/supabase');

  const { data: provider } = await supabase
    .from('providers')
    .select('id, slug')
    .eq('slug', 'dolap')
    .maybeSingle();

  if (!provider?.id) {
    throw new Error('Dolap provider not found in database');
  }

  console.log('Starting Dolap sync...');
  const sync = new SyncService([dolapProvider]);
  const result = await sync.runSync([], 10, 'dolap');

  console.log('Sync run status:', result.status);
  console.log('total_found:', result.total_found);
  console.log('total_imported:', result.total_imported);
  console.log('total_updated:', result.total_updated);
  console.log('total_failed:', result.total_failed);
  if (result.error_summary) console.log('errors:', result.error_summary);

  const { data: example } = await supabase
    .from('listings')
    .select('id, title, external_listing_id, url, source_url, price, district, city, seller_id, last_seen_at, is_active, updated_at')
    .eq('provider_id', provider.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('\nExample listing row:');
  console.log(JSON.stringify(example, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
