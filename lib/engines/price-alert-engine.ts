import { attachDealScoresToGroups } from '@/lib/engines/deal-score-engine';
import { groupListingsByProduct } from '@/lib/engines/product-matching-engine';
import {
  buildNotificationMessage,
  canReNotifyAlert,
  enrichListingsWithTrust,
  findMatchingListings,
  pickBestMatch,
} from '@/lib/engines/price-alert-matching';
export {
  canReNotifyAlert,
  dealQualityScoreFromPercentage,
} from '@/lib/engines/price-alert-matching';
import { priceAlertService } from '@/lib/services/price-alert-service';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ListingResponse,
  PriceAlertCheckResult,
  PriceAlertCreateInput,
  PriceAlertDTO,
  PriceAlertUpdateInput,
  PriceNotificationDTO,
} from '@/types';

function eligibleGroupedListings(listings: ListingResponse[]): ListingResponse[] {
  return listings.filter(
    (listing) => listing.is_active && !listing.deleted_at && !listing.is_bundle,
  );
}

function validateAlertInput(input: PriceAlertCreateInput): void {
  if (!input.group_id?.trim()) {
    throw new Error('group_id is required');
  }
  if (!Number.isFinite(input.max_price) || input.max_price <= 0) {
    throw new Error('max_price must be a positive number');
  }
  if (!Number.isFinite(input.min_deal_score) || input.min_deal_score < 0 || input.min_deal_score > 100) {
    throw new Error('min_deal_score must be between 0 and 100');
  }
  if (!Number.isFinite(input.min_trust_score) || input.min_trust_score < 0 || input.min_trust_score > 100) {
    throw new Error('min_trust_score must be between 0 and 100');
  }
  if (
    input.notify_again_after_days != null &&
    (!Number.isInteger(input.notify_again_after_days) || input.notify_again_after_days < 0)
  ) {
    throw new Error('notify_again_after_days must be a non-negative integer');
  }
}

async function fetchListingsForAlertCheck(): Promise<ListingResponse[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      provider:providers(*),
      seller:sellers(*)
    `,
    )
    .eq('is_active', true)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  return (data as ListingResponse[]) ?? [];
}

type AlertPersistAdapter = {
  createNotification: (input: {
    alert_id: string;
    group_id: string;
    listing_id: string;
    matched_price: number;
    matched_deal_score: number;
    matched_trust_score: number;
    message: string;
  }) => Promise<PriceNotificationDTO>;
  markTriggered: (
    alertId: string,
    listingId: string,
    triggerCount: number,
  ) => Promise<PriceAlertDTO>;
};

async function runAlertCheck(
  alerts: PriceAlertDTO[],
  listings: ListingResponse[],
  persist: AlertPersistAdapter,
): Promise<PriceAlertCheckResult> {
  const eligible = eligibleGroupedListings(listings);
  const withTrust = enrichListingsWithTrust(eligible);
  const baseGroups = groupListingsByProduct(withTrust);
  const groups = attachDealScoresToGroups(baseGroups, baseGroups);
  const groupMap = new Map(groups.map((group) => [group.id, group]));

  const notifications: PriceNotificationDTO[] = [];
  let triggered = 0;

  for (const alert of alerts) {
    if (!alert.is_active || !canReNotifyAlert(alert)) continue;

    const group = groupMap.get(alert.group_id);
    if (!group) continue;

    const matches = findMatchingListings(group, withTrust, alert);
    const best = pickBestMatch(matches);
    if (!best) continue;

    const notification = await persist.createNotification({
      alert_id: alert.id,
      group_id: alert.group_id,
      listing_id: best.listing.id,
      matched_price: best.price,
      matched_deal_score: best.dealScore,
      matched_trust_score: best.trustScore,
      message: buildNotificationMessage(group.label, best, best.listing),
    });

    await persist.markTriggered(alert.id, best.listing.id, alert.trigger_count + 1);
    notifications.push(notification);
    triggered += 1;
  }

  return {
    checked: alerts.filter((alert) => alert.is_active).length,
    triggered,
    notifications,
  };
}

export async function createPriceAlert(input: PriceAlertCreateInput): Promise<PriceAlertDTO> {
  validateAlertInput(input);
  return priceAlertService.create(input);
}

export async function updatePriceAlert(
  id: string,
  input: PriceAlertUpdateInput,
): Promise<PriceAlertDTO> {
  const existing = await priceAlertService.getById(id);
  if (!existing) throw new Error('Price alert not found');

  const merged: PriceAlertCreateInput = {
    group_id: input.group_id ?? existing.group_id,
    label: input.label !== undefined ? input.label : existing.label,
    max_price: input.max_price ?? existing.max_price,
    min_deal_score: input.min_deal_score ?? existing.min_deal_score,
    min_trust_score: input.min_trust_score ?? existing.min_trust_score,
    notify_once: input.notify_once ?? existing.notify_once,
    notify_again_after_days: input.notify_again_after_days ?? existing.notify_again_after_days,
    is_active: input.is_active ?? existing.is_active,
  };

  validateAlertInput(merged);
  return priceAlertService.update(id, input);
}

export async function deletePriceAlert(id: string): Promise<void> {
  const existing = await priceAlertService.getById(id);
  if (!existing) throw new Error('Price alert not found');
  await priceAlertService.delete(id);
}

export async function getPriceAlerts(options?: {
  groupId?: string;
  activeOnly?: boolean;
}): Promise<PriceAlertDTO[]> {
  if (options?.groupId) {
    return priceAlertService.getByGroup(options.groupId, options.activeOnly ?? false);
  }
  return priceAlertService.getAll(options?.activeOnly ?? false);
}

/** Compare active alerts against grouped listings after sync and emit notifications. */
export async function checkAlertsAfterSync(
  listings?: ListingResponse[],
): Promise<PriceAlertCheckResult> {
  const sourceListings = listings ?? (await fetchListingsForAlertCheck());
  const alerts = await priceAlertService.getAll(true);

  return runAlertCheck(alerts, sourceListings, {
    createNotification: (input) => priceAlertService.createNotification(input),
    markTriggered: (alertId, listingId, triggerCount) =>
      priceAlertService.markTriggered(alertId, listingId, triggerCount),
  });
}

/** Deno/sync-runner helper — evaluate alerts with an explicit Supabase client. */
export async function checkAlertsAfterSyncWithClient(
  client: SupabaseClient,
  listings?: ListingResponse[],
): Promise<PriceAlertCheckResult> {
  let sourceListings = listings;

  if (!sourceListings) {
    const { data, error } = await client
      .from('listings')
      .select('*, provider:providers(*), seller:sellers(*)')
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw new Error(error.message);
    sourceListings = (data as ListingResponse[]) ?? [];
  }

  const { data: alertRows, error: alertError } = await client
    .from('price_alerts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (alertError) throw new Error(alertError.message);

  const alerts = ((alertRows as PriceAlertDTO[]) ?? []).map((row) => ({
    ...row,
    max_price: Number(row.max_price),
    min_deal_score: Number(row.min_deal_score),
    min_trust_score: Number(row.min_trust_score),
    notify_again_after_days: Number(row.notify_again_after_days),
    trigger_count: Number(row.trigger_count),
  }));

  return runAlertCheck(alerts, sourceListings, {
    createNotification: async (input) => {
      const { data, error } = await client
        .from('price_notifications')
        .insert(input)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const row = data as PriceNotificationDTO;
      return {
        ...row,
        matched_price: Number(row.matched_price),
        matched_deal_score: Number(row.matched_deal_score),
        matched_trust_score: Number(row.matched_trust_score),
      };
    },
    markTriggered: async (alertId, listingId, triggerCount) => {
      const now = new Date().toISOString();
      const { data, error } = await client
        .from('price_alerts')
        .update({
          last_triggered_at: now,
          last_matched_listing_id: listingId,
          trigger_count: triggerCount,
          updated_at: now,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      const row = data as PriceAlertDTO;
      return {
        ...row,
        max_price: Number(row.max_price),
        min_deal_score: Number(row.min_deal_score),
        min_trust_score: Number(row.min_trust_score),
        notify_again_after_days: Number(row.notify_again_after_days),
        trigger_count: Number(row.trigger_count),
      };
    },
  });
}

export class PriceAlertEngine {
  create(input: PriceAlertCreateInput) {
    return createPriceAlert(input);
  }

  update(id: string, input: PriceAlertUpdateInput) {
    return updatePriceAlert(id, input);
  }

  delete(id: string) {
    return deletePriceAlert(id);
  }

  getAll(options?: { groupId?: string; activeOnly?: boolean }) {
    return getPriceAlerts(options);
  }

  checkAfterSync(listings?: ListingResponse[]) {
    return checkAlertsAfterSync(listings);
  }
}

export const priceAlertEngine = new PriceAlertEngine();
