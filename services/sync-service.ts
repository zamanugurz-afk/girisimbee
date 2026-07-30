import 'server-only';

import { supabase } from '@/lib/supabase';
import type {
  SyncRunDTO,
  SyncLogDTO,
  ProviderStatusDTO,
  ProductDTO,
} from '@/types';
import { captureGroupedProductPriceSnapshots } from '@/lib/engines/grouped-price-history-engine';
import { filterMarketplaceListings } from '@/lib/listing-window';
import type { ListingResponse } from '@/types';
import { checkAlertsAfterSync } from '@/lib/engines/price-alert-engine';
import {
  ALL_PROVIDERS,
} from './providers';
import type { ProviderServiceInterface, CollectionResult, ProviderRegistry } from './providers/provider-service.interface';
import { DataCollector } from './providers/data-collector';

/**
 * SyncService — orchestrates data collection across all providers.
 *
 * Responsibilities:
 * - Run provider collectors in parallel
 * - Track sync status in sync_runs table
 * - Store per-provider logs in sync_logs table
 * - Update provider_status after each run
 * - Continue on provider failure (never stop the whole sync)
 * - Track errors and durations
 */
export class SyncService {
  private registry: ProviderRegistry;

  constructor(providers?: ProviderServiceInterface[]) {
    this.registry = new Map();
    for (const p of providers ?? ALL_PROVIDERS) {
      this.registry.set(p.providerSlug, p);
    }
  }

  /**
   * Run a full sync cycle across all enabled providers.
   * Each provider runs independently — a failure in one
   * does not stop the others.
   */
  async runSync(
    keywords: string[] = [],
    intervalMinutes: number = 10,
    providerSlug?: string,
  ): Promise<SyncRunDTO> {
    // 1. Create sync_run record
    const { data: runData, error: runError } = await supabase
      .from('sync_runs')
      .insert({
        status: 'running',
        interval_minutes: intervalMinutes,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError) throw new Error(runError.message);
    const run = runData as SyncRunDTO;

    // 2. Get enabled providers with their DB IDs
    const { data: dbProviders, error: provError } = await supabase
      .from('providers')
      .select('*')
      .eq('is_enabled', true);

    if (provError || !dbProviders) {
      await this.finishRun(run.id, 'error', 0, 0, 0, 0, provError?.message ?? 'No providers found');
      return { ...run, status: 'error' };
    }

    // 2b. Get active products for title matching
    const { data: dbProducts } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    const activeProducts = (dbProducts as ProductDTO[]) ?? [];

    const providersToSync = providerSlug
      ? dbProviders.filter((p) => p.slug === providerSlug)
      : dbProviders;

    if (providersToSync.length === 0) {
      const message = providerSlug
        ? `Provider not found or disabled: ${providerSlug}`
        : 'No enabled providers found';
      await this.finishRun(run.id, 'error', 0, 0, 0, 0, message);
      throw new Error(message);
    }

    // 3. Run each provider collector independently
    const results: CollectionResult[] = [];
    const syncLogIds: string[] = [];

    for (const dbProvider of providersToSync) {
      await this.markProviderRunning(dbProvider.id);
      const providerService = this.registry.get(dbProvider.slug);
      if (!providerService) {
        results.push({
          providerSlug: dbProvider.slug,
          found: 0, imported: 0, updated: 0, failed: 0,
          durationMs: 0, avgResponseMs: 0, errors: ['Provider not registered'], skipped: true,
        });
        await this.updateProviderStatus(dbProvider.id, 'error', null, 'Provider not registered');
        continue;
      }

      // Create sync_log entry
      const { data: logData } = await supabase
        .from('sync_logs')
        .insert({
          sync_run_id: run.id,
          provider_id: dbProvider.id,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      const logId = logData?.id;
      if (logId) syncLogIds.push(logId);

      try {
        const collector = new DataCollector(providerService);
        const result = await collector.collect(
          dbProvider.id,
          activeProducts,
          keywords,
        );
        results.push(result);

        // Update sync_log with results
        if (logId) {
          await supabase.from('sync_logs').update({
            status: result.failed > 0 && result.imported === 0 ? 'error' : 'success',
            finished_at: new Date().toISOString(),
            duration_ms: result.durationMs,
            found_count: result.found,
            imported_count: result.imported,
            updated_count: result.updated,
            failed_count: result.failed,
            error_message: result.errors.join('; ') || null,
            avg_response_ms: result.avgResponseMs,
          }).eq('id', logId);
        }

        // Update provider_status
        await this.updateProviderStatus(dbProvider.id, 'success', result);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({
          providerSlug: dbProvider.slug,
          found: 0, imported: 0, updated: 0, failed: 1,
          durationMs: 0, avgResponseMs: 0, errors: [errMsg], skipped: false,
        });

        if (logId) {
          await supabase.from('sync_logs').update({
            status: 'error',
            finished_at: new Date().toISOString(),
            error_message: errMsg,
          }).eq('id', logId);
        }

        await this.updateProviderStatus(dbProvider.id, 'error', null, errMsg);
      }
    }

    // 4. Aggregate and finalize the sync run
    const totalFound = results.reduce((a, r) => a + r.found, 0);
    const totalImported = results.reduce((a, r) => a + r.imported, 0);
    const totalUpdated = results.reduce((a, r) => a + r.updated, 0);
    const totalFailed = results.reduce((a, r) => a + r.failed, 0);
    const errorCount = results.filter((r) => r.errors.length > 0 && !r.skipped).length;
    const successCount = results.filter((r) => r.errors.length === 0 && !r.skipped).length;

    let finalStatus: 'success' | 'partial' | 'error';
    if (errorCount === 0) finalStatus = 'success';
    else if (successCount > 0) finalStatus = 'partial';
    else finalStatus = 'error';

    const errorSummary = results
      .filter((r) => r.errors.length > 0)
      .map((r) => `${r.providerSlug}: ${r.errors.join(', ')}`)
      .join('; ') || null;

    await this.finishRun(
      run.id,
      finalStatus,
      totalFound,
      totalImported,
      totalUpdated,
      totalFailed,
      errorSummary,
    );

    try {
      const { data: snapshotRows, error: snapshotFetchError } = await supabase
        .from('listings')
        .select(
          'id, price, is_active, deleted_at, is_bundle, product_family, edition, storage, brand, platform, generation, model, color, bundle_type, title, item_condition, first_seen_at, created_at',
        )
        .eq('is_active', true)
        .is('deleted_at', null);

      if (snapshotFetchError) throw new Error(snapshotFetchError.message);

      await captureGroupedProductPriceSnapshots(
        filterMarketplaceListings((snapshotRows as ListingResponse[]) ?? []),
      );
    } catch (snapshotError) {
      const snapshotMessage =
        snapshotError instanceof Error ? snapshotError.message : String(snapshotError);
      await supabase
        .from('sync_runs')
        .update({
          error_summary: errorSummary
            ? `${errorSummary}; price snapshot: ${snapshotMessage}`
            : `price snapshot: ${snapshotMessage}`,
        })
        .eq('id', run.id);
    }

    try {
      await checkAlertsAfterSync();
    } catch (alertError) {
      const alertMessage =
        alertError instanceof Error ? alertError.message : String(alertError);
      await supabase
        .from('sync_runs')
        .update({
          error_summary: errorSummary
            ? `${errorSummary}; price alerts: ${alertMessage}`
            : `price alerts: ${alertMessage}`,
        })
        .eq('id', run.id);
    }

    return {
      ...run,
      status: finalStatus,
      finished_at: new Date().toISOString(),
      total_found: totalFound,
      total_imported: totalImported,
      total_updated: totalUpdated,
      total_failed: totalFailed,
      error_summary: errorSummary,
    };
  }

  private async finishRun(
    runId: string,
    status: string,
    found: number,
    imported: number,
    updated: number,
    failed: number,
    errorSummary: string | null,
  ): Promise<void> {
    await supabase
      .from('sync_runs')
      .update({
        status,
        finished_at: new Date().toISOString(),
        total_found: found,
        total_imported: imported,
        total_updated: updated,
        total_failed: failed,
        error_summary: errorSummary,
      })
      .eq('id', runId);
  }

  private async markProviderRunning(providerId: string): Promise<void> {
    const { data: existing } = await supabase
      .from('provider_status')
      .select('*')
      .eq('provider_id', providerId)
      .maybeSingle();

    const updateData = {
      status: 'running',
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('provider_status').update(updateData).eq('provider_id', providerId);
    } else {
      await supabase.from('provider_status').insert({
        provider_id: providerId,
        ...updateData,
      });
    }
  }

  private async updateProviderStatus(
    providerId: string,
    status: string,
    result: CollectionResult | null,
    errorMsg?: string,
  ): Promise<void> {
    // Check if provider_status row exists
    const { data: existing } = await supabase
      .from('provider_status')
      .select('*')
      .eq('provider_id', providerId)
      .maybeSingle();

    const updateData: Record<string, unknown> = {
      status,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (result) {
      updateData.last_sync_duration_ms = result.durationMs;
      updateData.avg_response_ms = result.avgResponseMs;
      updateData.total_listings_imported = (existing?.total_listings_imported ?? 0) + result.imported;
      if (result.errors.length > 0) {
        updateData.total_errors = (existing?.total_errors ?? 0) + result.errors.length;
      }
    }

    if (errorMsg) {
      updateData.total_errors = (existing?.total_errors ?? 0) + 1;
    }

    if (existing) {
      await supabase
        .from('provider_status')
        .update(updateData)
        .eq('provider_id', providerId);
    } else {
      await supabase
        .from('provider_status')
        .insert({
          provider_id: providerId,
          ...updateData,
        });
    }
  }

  /** Get the latest sync run. */
  async getLastSync(): Promise<SyncRunDTO | null> {
    const { data, error } = await supabase
      .from('sync_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as SyncRunDTO | null;
  }

  /** Get provider status for all providers. */
  async getProviderStatus(): Promise<ProviderStatusDTO[]> {
    const { data, error } = await supabase
      .from('provider_status')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ProviderStatusDTO[]) ?? [];
  }

  /** Get recent sync logs. */
  async getRecentLogs(limit: number = 20): Promise<SyncLogDTO[]> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*, provider:providers(name, slug)')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data as SyncLogDTO[]) ?? [];
  }
}

export const syncService = new SyncService();
