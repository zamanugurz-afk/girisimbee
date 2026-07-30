import { supabase } from '@/lib/supabase';
import type {
  PriceAlertCreateInput,
  PriceAlertDTO,
  PriceAlertUpdateInput,
  PriceNotificationDTO,
} from '@/types';

function normalizeAlert(row: PriceAlertDTO): PriceAlertDTO {
  return {
    ...row,
    max_price: Number(row.max_price),
    min_deal_score: Number(row.min_deal_score),
    min_trust_score: Number(row.min_trust_score),
    notify_again_after_days: Number(row.notify_again_after_days),
    trigger_count: Number(row.trigger_count),
  };
}

function normalizeNotification(row: PriceNotificationDTO): PriceNotificationDTO {
  return {
    ...row,
    matched_price: Number(row.matched_price),
    matched_deal_score: Number(row.matched_deal_score),
    matched_trust_score: Number(row.matched_trust_score),
  };
}

export class PriceAlertService {
  private alertsTable = 'price_alerts';
  private notificationsTable = 'price_notifications';

  async getAll(activeOnly = false): Promise<PriceAlertDTO[]> {
    let query = supabase.from(this.alertsTable).select('*').order('created_at', { ascending: false });
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data as PriceAlertDTO[]) ?? []).map(normalizeAlert);
  }

  async getById(id: string): Promise<PriceAlertDTO | null> {
    const { data, error } = await supabase
      .from(this.alertsTable)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? normalizeAlert(data as PriceAlertDTO) : null;
  }

  async getByGroup(groupId: string, activeOnly = false): Promise<PriceAlertDTO[]> {
    let query = supabase.from(this.alertsTable).select('*').eq('group_id', groupId);
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data as PriceAlertDTO[]) ?? []).map(normalizeAlert);
  }

  async create(input: PriceAlertCreateInput): Promise<PriceAlertDTO> {
    const { data, error } = await supabase
      .from(this.alertsTable)
      .insert({
        group_id: input.group_id,
        label: input.label ?? null,
        max_price: input.max_price,
        min_deal_score: input.min_deal_score,
        min_trust_score: input.min_trust_score,
        notify_once: input.notify_once ?? true,
        notify_again_after_days: input.notify_again_after_days ?? 0,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return normalizeAlert(data as PriceAlertDTO);
  }

  async update(id: string, input: PriceAlertUpdateInput): Promise<PriceAlertDTO> {
    const { data, error } = await supabase
      .from(this.alertsTable)
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return normalizeAlert(data as PriceAlertDTO);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.alertsTable).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async markTriggered(
    alertId: string,
    listingId: string,
    triggerCount: number,
  ): Promise<PriceAlertDTO> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(this.alertsTable)
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
    return normalizeAlert(data as PriceAlertDTO);
  }

  async createNotification(input: {
    alert_id: string;
    group_id: string;
    listing_id: string;
    matched_price: number;
    matched_deal_score: number;
    matched_trust_score: number;
    message: string;
  }): Promise<PriceNotificationDTO> {
    const { data, error } = await supabase
      .from(this.notificationsTable)
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return normalizeNotification(data as PriceNotificationDTO);
  }

  async getNotifications(alertId?: string): Promise<PriceNotificationDTO[]> {
    let query = supabase.from(this.notificationsTable).select('*');
    if (alertId) query = query.eq('alert_id', alertId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data as PriceNotificationDTO[]) ?? []).map(normalizeNotification);
  }
}

export const priceAlertService = new PriceAlertService();
