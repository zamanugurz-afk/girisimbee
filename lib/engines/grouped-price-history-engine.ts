import { groupListingsByProduct } from '@/lib/engines/product-matching-engine';
import { PriceEngine } from '@/lib/engines/price-engine';
import { supabase } from '@/lib/supabase';
import {
  groupedProductPriceHistoryService,
  type GroupedPriceSnapshotInput,
  resolveGroupedPriceHistoryStartDate,
} from '@/lib/services/grouped-product-price-history-service';
import type {
  GroupedAveragePricePoint,
  GroupedPriceHistoryPeriod,
  GroupedPriceTrendResult,
  GroupedProductPriceSnapshotDTO,
  ListingResponse,
} from '@/types';

export type { GroupedPriceHistoryPeriod };

function todaySnapshotDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function eligibleGroupedListings(listings: ListingResponse[]): ListingResponse[] {
  return listings.filter(
    (listing) => listing.is_active && !listing.deleted_at && !listing.is_bundle,
  );
}

export function buildGroupedPriceSnapshots(
  groups: ReturnType<typeof groupListingsByProduct>,
  snapshotDate: string = todaySnapshotDate(),
): GroupedPriceSnapshotInput[] {
  return groups.map((group) => ({
    group_id: group.id,
    snapshot_date: snapshotDate,
    lowest_price: group.lowest_price,
    average_price: group.average_price,
    highest_price: group.highest_price,
    listing_count: group.listing_count,
  }));
}

async function fetchActiveListingsForSnapshots(): Promise<ListingResponse[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      provider_id,
      product_id,
      external_listing_id,
      title,
      description,
      url,
      source_url,
      image_urls,
      price,
      previous_price,
      currency,
      district,
      city,
      listing_date,
      first_seen_at,
      last_seen_at,
      condition,
      product_family,
      edition,
      storage,
      item_condition,
      bundle_type,
      is_bundle,
      brand,
      platform,
      generation,
      model,
      color,
      seller_id,
      is_active,
      deleted_at,
      created_at,
      updated_at
    `,
    )
    .eq('is_active', true)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  return (data as ListingResponse[]) ?? [];
}

/** Capture daily grouped-product price snapshots after a sync completes. */
export async function captureGroupedProductPriceSnapshots(
  listings?: ListingResponse[],
): Promise<{ groupsCaptured: number; snapshotDate: string }> {
  const sourceListings = listings ?? (await fetchActiveListingsForSnapshots());
  const groups = groupListingsByProduct(eligibleGroupedListings(sourceListings));
  const snapshotDate = todaySnapshotDate();
  const snapshots = buildGroupedPriceSnapshots(groups, snapshotDate);
  const groupsCaptured = await groupedProductPriceHistoryService.upsertSnapshots(snapshots);

  return { groupsCaptured, snapshotDate };
}

/** Deno/sync-runner helper — upsert snapshots with an explicit Supabase client. */
export async function captureGroupedProductPriceSnapshotsWithClient(
  client: {
    from: (table: string) => {
      select: (query: string) => {
        eq: (column: string, value: boolean) => {
          is: (column: string, value: null) => Promise<{ data: ListingResponse[] | null; error: { message: string } | null }>;
        };
      };
      upsert: (
        values: GroupedPriceSnapshotInput[],
        options?: { onConflict?: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  },
  listings?: ListingResponse[],
): Promise<{ groupsCaptured: number; snapshotDate: string }> {
  let sourceListings = listings;

  if (!sourceListings) {
    const { data, error } = await client
      .from('listings')
      .select(
        'id, price, is_active, deleted_at, is_bundle, product_family, edition, storage, brand, platform, generation, model, color, bundle_type, title, item_condition',
      )
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw new Error(error.message);
    sourceListings = (data as ListingResponse[]) ?? [];
  }

  const groups = groupListingsByProduct(eligibleGroupedListings(sourceListings));
  const snapshotDate = todaySnapshotDate();
  const snapshots = buildGroupedPriceSnapshots(groups, snapshotDate);

  if (snapshots.length === 0) {
    return { groupsCaptured: 0, snapshotDate };
  }

  const { error: upsertError } = await client.from('grouped_product_price_history').upsert(snapshots, {
    onConflict: 'group_id,snapshot_date',
  });

  if (upsertError) throw new Error(upsertError.message);
  return { groupsCaptured: snapshots.length, snapshotDate };
}

export async function getPriceHistory(
  groupId: string,
  period: GroupedPriceHistoryPeriod = 'all',
): Promise<GroupedProductPriceSnapshotDTO[]> {
  const fromDate = resolveGroupedPriceHistoryStartDate(period);
  return groupedProductPriceHistoryService.getByGroup(groupId, fromDate);
}

export async function getLowestEverPrice(groupId: string): Promise<number | null> {
  const history = await getPriceHistory(groupId, 'all');
  if (history.length === 0) return null;
  return Math.min(...history.map((row) => row.lowest_price));
}

export async function getHighestEverPrice(groupId: string): Promise<number | null> {
  const history = await getPriceHistory(groupId, 'all');
  if (history.length === 0) return null;
  return Math.max(...history.map((row) => row.highest_price));
}

export async function getAverageHistory(
  groupId: string,
  period: GroupedPriceHistoryPeriod = 'all',
): Promise<GroupedAveragePricePoint[]> {
  const history = await getPriceHistory(groupId, period);
  return history.map((row) => ({
    date: row.snapshot_date,
    average_price: row.average_price,
  }));
}

export async function getPriceTrend(
  groupId: string,
  period: GroupedPriceHistoryPeriod = '30d',
): Promise<GroupedPriceTrendResult> {
  const snapshots = await getPriceHistory(groupId, period);
  const priceEngine = new PriceEngine();

  if (snapshots.length === 0) {
    return {
      period,
      change_pct: 0,
      direction: 'stable',
      start_average: 0,
      end_average: 0,
      lowest_ever: 0,
      highest_ever: 0,
      snapshots,
    };
  }

  const startAverage = snapshots[0]!.average_price;
  const endAverage = snapshots[snapshots.length - 1]!.average_price;
  const changePct = priceEngine.priceChangePct(startAverage, endAverage);
  const allHistory = period === 'all' ? snapshots : await getPriceHistory(groupId, 'all');

  return {
    period,
    change_pct: changePct,
    direction: priceEngine.trendDirection(changePct),
    start_average: startAverage,
    end_average: endAverage,
    lowest_ever:
      allHistory.length > 0 ? Math.min(...allHistory.map((row) => row.lowest_price)) : 0,
    highest_ever:
      allHistory.length > 0 ? Math.max(...allHistory.map((row) => row.highest_price)) : 0,
    snapshots,
  };
}

export class GroupedPriceHistoryEngine {
  captureSnapshots(listings?: ListingResponse[]) {
    return captureGroupedProductPriceSnapshots(listings);
  }

  getPriceHistory(groupId: string, period: GroupedPriceHistoryPeriod = 'all') {
    return getPriceHistory(groupId, period);
  }

  getLowestEverPrice(groupId: string) {
    return getLowestEverPrice(groupId);
  }

  getHighestEverPrice(groupId: string) {
    return getHighestEverPrice(groupId);
  }

  getAverageHistory(groupId: string, period: GroupedPriceHistoryPeriod = 'all') {
    return getAverageHistory(groupId, period);
  }

  getPriceTrend(groupId: string, period: GroupedPriceHistoryPeriod = '30d') {
    return getPriceTrend(groupId, period);
  }
}

export const groupedPriceHistoryEngine = new GroupedPriceHistoryEngine();
