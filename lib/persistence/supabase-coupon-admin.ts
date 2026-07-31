import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminModuleCoupon } from '@/features/admin/types/admin.types';

interface CouponRow {
  code: string;
  discount_percent: number | null;
  discount_cents: number | null;
  valid_package_slugs: string[] | null;
  active: boolean;
  expires_at: string | null;
}

function mapCoupon(row: CouponRow): AdminModuleCoupon {
  return {
    code: row.code,
    discountPercent: row.discount_percent,
    discountCents: row.discount_cents,
    validPackageSlugs: row.valid_package_slugs,
    active: row.active,
    expiresAt: row.expires_at,
  };
}

function toRow(coupon: AdminModuleCoupon): CouponRow {
  return {
    code: coupon.code.toUpperCase(),
    discount_percent: coupon.discountPercent,
    discount_cents: coupon.discountCents,
    valid_package_slugs: coupon.validPackageSlugs,
    active: coupon.active,
    expires_at: coupon.expiresAt,
  };
}

export async function listModuleCoupons(
  supabase: SupabaseClient,
  table: string,
): Promise<AdminModuleCoupon[]> {
  const { data, error } = await supabase.from(table).select('*').order('code');
  if (error) throw error;
  return (data as CouponRow[]).map(mapCoupon);
}

export async function upsertModuleCoupon(
  supabase: SupabaseClient,
  table: string,
  coupon: AdminModuleCoupon,
): Promise<AdminModuleCoupon> {
  const row = toRow(coupon);
  const { data, error } = await supabase.from(table).upsert(row).select('*').single();
  if (error) throw error;
  return mapCoupon(data as CouponRow);
}

export async function deleteModuleCoupon(
  supabase: SupabaseClient,
  table: string,
  code: string,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('code', code.toUpperCase());
  if (error) throw error;
}
