import { supabase } from '@/lib/supabase';
import type {
  PriceHistoryDTO,
  PriceHistoryResponse,
  PriceHistoryCreate,
  PriceHistoryFilter,
  PriceHistoryPoint,
  PriceHistorySummary,
} from '@/types';
import { PriceEngine } from '@/lib/engines/price-engine';

export class PriceHistoryService {
  private table = 'price_history';

  async getAll(filter?: PriceHistoryFilter): Promise<PriceHistoryResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, listing:listings(*)');
    if (filter?.listing_id) q = q.eq('listing_id', filter.listing_id);
    if (filter?.from_date) q = q.gte('detected_at', filter.from_date);
    if (filter?.to_date) q = q.lte('detected_at', filter.to_date);
    const { data, error } = await q.order('detected_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data as PriceHistoryResponse[]) ?? [];
  }

  async getByListing(listingId: string): Promise<PriceHistoryDTO[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('listing_id', listingId)
      .order('detected_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data as PriceHistoryDTO[]) ?? [];
  }

  async create(input: PriceHistoryCreate): Promise<PriceHistoryDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({
        listing_id: input.listing_id,
        price: input.price,
        detected_at: input.detected_at ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PriceHistoryDTO;
  }

  async getSummary(listingId: string, days = 30): Promise<PriceHistorySummary> {
    const history = await this.getByListing(listingId);
    const fromDate = new Date(Date.now() - days * 86400000);
    const filtered = history.filter((h) => new Date(h.detected_at) >= fromDate);

    const points: PriceHistoryPoint[] = filtered.map((h) => ({
      date: h.detected_at,
      price: h.price,
      label: new Date(h.detected_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
    }));

    const prices = filtered.map((h) => h.price);
    if (prices.length === 0) {
      return { points, change_pct: 0, trend: 'stable', min: 0, max: 0, avg: 0, range_pct: 0 };
    }

    const engine = new PriceEngine();
    const first = prices[0];
    const last = prices[prices.length - 1];
    const changePct = first > 0 ? engine.priceChangePct(first, last) : 0;

    return {
      points,
      change_pct: changePct,
      trend: engine.trendDirection(changePct),
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: engine.average(prices),
      range_pct: engine.rangePct(Math.min(...prices), Math.max(...prices)),
    };
  }
}

export const priceHistoryService = new PriceHistoryService();
