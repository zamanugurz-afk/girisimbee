import { supabase } from '@/lib/supabase';
import type {
  SyncRunDTO,
  SyncLogDTO,
  ProviderStatusDTO,
  DashboardSyncData,
} from '@/types';

/**
 * SyncStatusService — reads sync infrastructure data for the dashboard.
 * Separated from SyncService (which writes) to keep reads lightweight.
 */
export class SyncStatusService {
  async getProviderStatus(): Promise<ProviderStatusDTO[]> {
    const { data, error } = await supabase
      .from('provider_status')
      .select('*, provider:providers(name, slug, logo_url, website)')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ProviderStatusDTO[]) ?? [];
  }

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

  async getRecentRuns(limit: number = 10): Promise<SyncRunDTO[]> {
    const { data, error } = await supabase
      .from('sync_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data as SyncRunDTO[]) ?? [];
  }

  async getRecentLogs(limit: number = 20): Promise<SyncLogDTO[]> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*, provider:providers(name, slug)')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data as SyncLogDTO[]) ?? [];
  }

  /** Get listings imported today count. */
  async getImportedToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  /** Get listings first seen today count. */
  async getListingsToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .gte('first_seen_at', todayStart.toISOString());

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  /** Get price changes today count. */
  async getPriceChangesToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('price_history')
      .select('id', { count: 'exact', head: true })
      .gte('detected_at', todayStart.toISOString());

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  /** Aggregate all dashboard sync data in one call. */
  async getDashboardSyncData(): Promise<DashboardSyncData> {
    const [providerStatus, lastSync, recentLogs, importedToday, listingsToday, priceChangesToday] =
      await Promise.all([
        this.getProviderStatus(),
        this.getLastSync(),
        this.getRecentLogs(10),
        this.getImportedToday(),
        this.getListingsToday(),
        this.getPriceChangesToday(),
      ]);

    return {
      providerStatus,
      lastSync,
      importedToday,
      listingsToday,
      priceChangesToday,
      recentLogs,
    };
  }
}

export const syncStatusService = new SyncStatusService();
