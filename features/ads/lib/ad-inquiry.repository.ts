import type { SupabaseClient } from '@supabase/supabase-js';
import { MARKET_AD_PRICE_TL } from '@/features/ads/constants/ad-inquiry.constants';
import type {
  AdInquiry,
  AdInquiryStatus,
  CreateAdInquiryInput,
  UpdateAdInquiryInput,
} from '@/features/ads/types/ad-inquiry.types';

const TABLE = 'marketplace_ad_inquiries';

interface AdInquiryRow {
  id: string;
  kind: string;
  status: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  price_tl: number | null;
  partnership_type: string | null;
  message: string | null;
  admin_note: string | null;
  payment_id?: string | null;
  payment_session_id?: string | null;
  market_item_id?: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: AdInquiryRow): AdInquiry {
  return {
    id: row.id,
    kind: row.kind as AdInquiry['kind'],
    status: row.status as AdInquiryStatus,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    ctaLabel: row.cta_label,
    priceTl: row.price_tl,
    partnershipType: row.partnership_type,
    message: row.message,
    adminNote: row.admin_note,
    paymentId: row.payment_id ?? null,
    paymentSessionId: row.payment_session_id ?? null,
    marketItemId: row.market_item_id ?? null,
    createdBy: row.created_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAdInquiry(
  supabase: SupabaseClient,
  input: CreateAdInquiryInput,
  createdBy?: string | null,
  initialStatus: AdInquiryStatus = 'new',
): Promise<AdInquiry> {
  const base = {
    kind: input.kind,
    status: initialStatus,
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    company: input.company?.trim() || null,
    created_by: createdBy ?? null,
  };

  const payload =
    input.kind === 'market_ad'
      ? {
          ...base,
          title: input.title.trim(),
          description: input.description?.trim() || '',
          image_url: input.imageUrl?.trim() || null,
          link_url: input.linkUrl?.trim() || null,
          cta_label: input.ctaLabel?.trim() || 'İncele',
          price_tl: MARKET_AD_PRICE_TL,
          partnership_type: null,
          message: null,
        }
      : {
          ...base,
          title: null,
          description: null,
          image_url: null,
          link_url: null,
          cta_label: null,
          price_tl: null,
          partnership_type: input.partnershipType,
          message: input.message.trim(),
        };

  const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return mapRow(data as AdInquiryRow);
}

export async function listAdInquiries(
  supabase: SupabaseClient,
  options?: { status?: AdInquiryStatus; kind?: AdInquiry['kind'] },
): Promise<AdInquiry[]> {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) query = query.eq('status', options.status);
  if (options?.kind) query = query.eq('kind', options.kind);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as AdInquiryRow[] | null)?.map(mapRow) ?? [];
}

export async function getAdInquiry(
  supabase: SupabaseClient,
  id: string,
): Promise<AdInquiry | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as AdInquiryRow) : null;
}

export async function getAdInquiryByPaymentSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<AdInquiry | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('payment_session_id', sessionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as AdInquiryRow) : null;
}

export async function updateAdInquiry(
  supabase: SupabaseClient,
  id: string,
  input: UpdateAdInquiryInput,
  reviewedBy?: string | null,
): Promise<AdInquiry> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status !== 'new') {
      patch.reviewed_at = new Date().toISOString();
      if (reviewedBy) patch.reviewed_by = reviewedBy;
    }
  }
  if (input.adminNote !== undefined) patch.admin_note = input.adminNote;
  if (input.paymentId !== undefined) patch.payment_id = input.paymentId;
  if (input.paymentSessionId !== undefined) patch.payment_session_id = input.paymentSessionId;
  if (input.marketItemId !== undefined) patch.market_item_id = input.marketItemId;

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as AdInquiryRow);
}

export async function deleteAdInquiry(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
