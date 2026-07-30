'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncStatusService } from '@/lib/services';
import type { DashboardSyncData, SyncRunDTO } from '@/types';

export interface TriggerSyncParams {
  keywords?: string[];
  intervalMinutes?: number;
  providerSlug?: string;
}

/** Query keys refreshed after a successful sync. */
function invalidatePostSyncQueries(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = [
    ['sync-dashboard'],
    ['provider-status'],
    ['sync-logs'],
    ['legacy-sync-runs'],
    ['listings'],
    ['legacy-listings'],
    ['filtered-listings'],
    ['providers'],
    ['categories'],
    ['active-products'],
    ['sellers'],
    ['alarms'],
    ['favorites'],
    ['legacy-market-stats'],
    ['legacy-notifications'],
    ['listing'],
    ['price-history'],
    ['price-history-batch'],
    ['legacy-price-history'],
  ] as const;

  for (const queryKey of keys) {
    queryClient.invalidateQueries({ queryKey });
  }
}

/**
 * Fetches aggregated sync dashboard data: provider status,
 * last sync run, imported/listings/price-changes today, recent logs.
 */
export function useSyncDashboardData() {
  return useQuery<DashboardSyncData>({
    queryKey: ['sync-dashboard'],
    queryFn: () => syncStatusService.getDashboardSyncData(),
    refetchInterval: 30000,
  });
}

/** Fetches provider status list. */
export function useProviderStatus() {
  return useQuery({
    queryKey: ['provider-status'],
    queryFn: () => syncStatusService.getProviderStatus(),
    refetchInterval: 30000,
  });
}

/** Fetches recent sync logs. */
export function useRecentSyncLogs(limit: number = 20) {
  return useQuery({
    queryKey: ['sync-logs', limit],
    queryFn: () => syncStatusService.getRecentLogs(limit),
  });
}

/** Triggers a manual sync run via the server API route. */
export function useTriggerSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: TriggerSyncParams = {}) => {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? `Sync failed (${res.status})`);
      }

      return res.json() as Promise<SyncRunDTO>;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['legacy-sync-runs'] });
    },
    onSuccess: (result: SyncRunDTO) => {
      invalidatePostSyncQueries(queryClient);
      return result;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-sync-runs'] });
      queryClient.invalidateQueries({ queryKey: ['sync-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['provider-status'] });
    },
  });
}
