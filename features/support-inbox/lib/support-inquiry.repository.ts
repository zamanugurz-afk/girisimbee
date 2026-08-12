import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateSupportInquiryInput,
  SupportInquiry,
  SupportInquiryChannel,
  SupportInquiryStatus,
  SupportInquirySubject,
  UpdateSupportInquiryInput,
} from '@/features/support-inbox/types/support-inquiry.types';

const TABLE = 'marketplace_support_inquiries';

type Row = {
  id: string;
  channel: string;
  status: string;
  subject: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  admin_note: string | null;
  created_by: string | null;
  conversation_id?: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): SupportInquiry {
  return {
    id: row.id,
    channel: row.channel as SupportInquiryChannel,
    status: row.status as SupportInquiryStatus,
    subject: row.subject as SupportInquirySubject,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    adminNote: row.admin_note,
    createdBy: row.created_by,
    conversationId: row.conversation_id ?? null,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createSupportInquiry(
  supabase: SupabaseClient,
  input: CreateSupportInquiryInput,
  createdBy?: string | null,
): Promise<SupportInquiry> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      channel: input.channel ?? 'support',
      status: 'new',
      subject: input.subject,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      message: input.message.trim(),
      created_by: createdBy ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function listSupportInquiries(
  supabase: SupabaseClient,
  options?: { status?: SupportInquiryStatus; channel?: SupportInquiryChannel },
): Promise<SupportInquiry[]> {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (options?.status) query = query.eq('status', options.status);
  if (options?.channel) query = query.eq('channel', options.channel);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(mapRow);
}

export async function getSupportInquiry(
  supabase: SupabaseClient,
  id: string,
): Promise<SupportInquiry | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as Row) : null;
}

export async function updateSupportInquiry(
  supabase: SupabaseClient,
  id: string,
  input: UpdateSupportInquiryInput,
  reviewedBy?: string | null,
): Promise<SupportInquiry> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status !== 'new') {
      patch.reviewed_by = reviewedBy ?? null;
      patch.reviewed_at = new Date().toISOString();
    }
  }
  if (input.adminNote !== undefined) {
    patch.admin_note = input.adminNote;
  }
  if (input.conversationId !== undefined) {
    patch.conversation_id = input.conversationId;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteSupportInquiry(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
