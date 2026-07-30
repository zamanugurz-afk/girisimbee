import { supabase } from '@/lib/supabase';
import type {
  MarketStatisticsDTO,
  MarketStatisticsResponse,
  MarketStatisticsCreate,
  MarketStatisticsUpdate,
  MarketStatisticsFilter,
} from '@/types';

export class StatisticsService {
  private table = 'market_statistics';

  async getAll(filter?: MarketStatisticsFilter): Promise<MarketStatisticsResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, product:products(*)');
    if (filter?.product_id) q = q.eq('product_id', filter.product_id);
    if (filter?.min_listings !== undefined) q = q.gte('listing_count', filter.min_listings);
    const { data, error } = await q.order('median_price');
    if (error) throw new Error(error.message);
    const rows = (data as MarketStatisticsDTO[]) ?? [];
    return rows.map((r) => ({
      ...r,
      spread_pct: r.median_price > 0 ? ((r.maximum_price - r.minimum_price) / r.median_price) * 100 : 0,
      discount_depth_pct: r.median_price > 0 ? ((r.median_price - r.minimum_price) / r.median_price) * 100 : 0,
    })) as MarketStatisticsResponse[];
  }

  async getByProduct(productId: string): Promise<MarketStatisticsResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, product:products(*)')
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as MarketStatisticsDTO;
    return {
      ...row,
      spread_pct: row.median_price > 0 ? ((row.maximum_price - row.minimum_price) / row.median_price) * 100 : 0,
      discount_depth_pct: row.median_price > 0 ? ((row.median_price - row.minimum_price) / row.median_price) * 100 : 0,
    } as MarketStatisticsResponse;
  }

  async upsert(input: MarketStatisticsCreate): Promise<MarketStatisticsDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .upsert(
        {
          product_id: input.product_id,
          average_price: input.average_price,
          median_price: input.median_price,
          minimum_price: input.minimum_price,
          maximum_price: input.maximum_price,
          listing_count: input.listing_count,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as MarketStatisticsDTO;
  }

  async update(productId: string, input: MarketStatisticsUpdate): Promise<MarketStatisticsDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('product_id', productId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as MarketStatisticsDTO;
  }

  async recomputeForProduct(productId: string, prices: number[]): Promise<MarketStatisticsDTO> {
    if (prices.length === 0) {
      return await this.upsert({
        product_id: productId,
        average_price: 0,
        median_price: 0,
        minimum_price: 0,
        maximum_price: 0,
        listing_count: 0,
      });
    }
    const sorted = [...prices].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = prices.reduce((a, p) => a + p, 0) / prices.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    return await this.upsert({
      product_id: productId,
      average_price: Math.round(avg),
      median_price: Math.round(median),
      minimum_price: min,
      maximum_price: max,
      listing_count: prices.length,
    });
  }
}

export const statisticsService = new StatisticsService();
