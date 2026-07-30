import { supabase } from '@/lib/supabase';
import type {
  GroupedPriceHistoryPeriod,
  GroupedProductPriceSnapshotDTO,
} from '@/types';

export interface GroupedPriceSnapshotInput {
  group_id: string;
  snapshot_date: string;
  lowest_price: number;
  average_price: number;
  highest_price: number;
  listing_count: number;
}

export function resolveGroupedPriceHistoryStartDate(
  period: GroupedPriceHistoryPeriod,
): string | null {
  if (period === 'all') return null;

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const start = new Date(Date.now() - days * 86400000);
  return start.toISOString().slice(0, 10);
}

function normalizeSnapshots(
  rows: GroupedProductPriceSnapshotDTO[],
): GroupedProductPriceSnapshotDTO[] {
  return rows.map((row) => ({
    ...row,
    lowest_price: Number(row.lowest_price),
    average_price: Number(row.average_price),
    highest_price: Number(row.highest_price),
    listing_count: Number(row.listing_count),
  }));
}

export class GroupedProductPriceHistoryService {
  private table = 'grouped_product_price_history';

  async upsertSnapshots(snapshots: GroupedPriceSnapshotInput[]): Promise<number> {
    if (snapshots.length === 0) return 0;

    const { error } = await supabase.from(this.table).upsert(snapshots, {
      onConflict: 'group_id,snapshot_date',
    });

    if (error) throw new Error(error.message);
    return snapshots.length;
  }

  async getByGroup(
    groupId: string,
    fromDate?: string | null,
  ): Promise<GroupedProductPriceSnapshotDTO[]> {
    let query = supabase.from(this.table).select('*').eq('group_id', groupId);

    if (fromDate) {
      query = query.gte('snapshot_date', fromDate);
    }

    const { data, error } = await query.order('snapshot_date', { ascending: true });
    if (error) throw new Error(error.message);
    return normalizeSnapshots((data as GroupedProductPriceSnapshotDTO[]) ?? []);
  }
}

export const groupedProductPriceHistoryService = new GroupedProductPriceHistoryService();
