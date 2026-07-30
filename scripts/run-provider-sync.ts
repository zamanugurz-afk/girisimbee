/**
 * Sync runner for all marketplace providers.
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

  const slugArg = process.argv[2];
  const { SyncService } = await import('../services/sync-service');
  const { ALL_PROVIDERS } = await import('../services/providers');
  const { supabase } = await import('../lib/supabase');

  const providers = slugArg
    ? ALL_PROVIDERS.filter((p) => p.providerSlug === slugArg)
    : ALL_PROVIDERS;

  if (providers.length === 0) {
    throw new Error(`No provider found for slug: ${slugArg}`);
  }

  const sync = new SyncService(providers);
  const startedAt = new Date().toISOString();
  const result = await sync.runSync([], 10, slugArg);

  console.log('Sync run status:', result.status);
  console.log('total_found:', result.total_found);
  console.log('total_imported:', result.total_imported);
  console.log('total_updated:', result.total_updated);
  console.log('total_failed:', result.total_failed);
  if (result.error_summary) console.log('errors:', result.error_summary);

  const { data: syncLogs } = await supabase
    .from('sync_logs')
    .select('imported_count, updated_count, found_count, provider:providers(slug)')
    .eq('sync_run_id', result.id)
    .gte('started_at', startedAt);

  const importedByProvider: Record<string, number> = {
    letgo: 0,
    dolap: 0,
  };
  for (const log of syncLogs ?? []) {
    const provider = log.provider as { slug?: string } | { slug?: string }[] | null;
    const slug = Array.isArray(provider) ? provider[0]?.slug : provider?.slug;
    if (slug && slug in importedByProvider) {
      importedByProvider[slug] += log.imported_count ?? 0;
    }
  }
  console.log('\nPer-provider imported this run:', importedByProvider);

  for (const provider of providers) {
    const { data: providerRow } = await supabase
      .from('providers')
      .select('id, slug')
      .eq('slug', provider.providerSlug)
      .maybeSingle();

    if (!providerRow?.id) {
      console.log(`\n[${provider.providerSlug}] provider not found in database`);
      continue;
    }

    const { data: row } = await supabase
      .from('listings')
      .select('title, external_listing_id, url')
      .eq('provider_id', providerRow.id)
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (row) {
      console.log(`\n[${provider.providerSlug}] example:`);
      console.log(JSON.stringify(row, null, 2));
    } else {
      console.log(`\n[${provider.providerSlug}] no listings in database`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
