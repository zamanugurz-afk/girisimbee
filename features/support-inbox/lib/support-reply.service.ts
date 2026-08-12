import type { SupabaseClient } from '@supabase/supabase-js';
import { ids, type ConversationId, type MessageId, type UserId } from '@/lib/domain/ids';
import { SUPPORT_INQUIRY_SUBJECT_LABELS } from '@/features/support-inbox/constants/support-inquiry.constants';
import {
  getSupportInquiry,
  updateSupportInquiry,
} from '@/features/support-inbox/lib/support-inquiry.repository';
import type {
  SupportInquiry,
  SupportInquiryStatus,
} from '@/features/support-inbox/types/support-inquiry.types';

type ConversationHit = {
  id: string;
  status: string;
};

async function resolveRecipientUserId(
  supabase: SupabaseClient,
  inquiry: SupportInquiry,
): Promise<UserId | null> {
  if (inquiry.createdBy) return inquiry.createdBy as UserId;

  const email = inquiry.email.trim().toLowerCase();
  if (!email) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .neq('account_status', 'deleted')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.id as UserId | undefined) ?? null;
}

async function findOpenSupportConversationForUser(
  supabase: SupabaseClient,
  userId: UserId,
  inquiryId?: string,
): Promise<ConversationHit | null> {
  if (inquiryId) {
    const { data: byInquiry } = await supabase
      .from('marketplace_conversations')
      .select('id, status')
      .eq('kind', 'support')
      .eq('support_inquiry_id', inquiryId)
      .is('deleted_at', null)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byInquiry) return byInquiry as ConversationHit;
  }

  const { data: participantRows, error } = await supabase
    .from('marketplace_conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const idsFound = (participantRows ?? []).map((r) => r.conversation_id as string);
  if (idsFound.length === 0) return null;

  const { data: conversations, error: cErr } = await supabase
    .from('marketplace_conversations')
    .select('id, status, last_message_at, created_at')
    .in('id', idsFound)
    .eq('kind', 'support')
    .is('deleted_at', null)
    .neq('status', 'deleted')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(1);
  if (cErr) throw new Error(cErr.message);

  const hit = conversations?.[0];
  return hit ? { id: hit.id, status: hit.status } : null;
}

async function ensureSupportConversation(params: {
  supabase: SupabaseClient;
  adminUserId: UserId;
  recipientUserId: UserId;
  inquiry: SupportInquiry;
}): Promise<ConversationId> {
  const { supabase, adminUserId, recipientUserId, inquiry } = params;

  if (inquiry.conversationId) {
    const { data } = await supabase
      .from('marketplace_conversations')
      .select('id, status')
      .eq('id', inquiry.conversationId)
      .is('deleted_at', null)
      .maybeSingle();
    if (data?.id) {
      await ensureParticipants(supabase, data.id as ConversationId, [
        adminUserId,
        recipientUserId,
      ]);
      if (data.status === 'archived') {
        await supabase
          .from('marketplace_conversations')
          .update({ status: 'open', updated_at: new Date().toISOString() })
          .eq('id', data.id);
      }
      return data.id as ConversationId;
    }
  }

  const existing = await findOpenSupportConversationForUser(
    supabase,
    recipientUserId,
    inquiry.id,
  );
  if (existing) {
    await ensureParticipants(supabase, existing.id as ConversationId, [
      adminUserId,
      recipientUserId,
    ]);
    if (existing.status === 'archived') {
      await supabase
        .from('marketplace_conversations')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    }
    return existing.id as ConversationId;
  }

  const conversationId = ids.conversation(crypto.randomUUID());
  const { error } = await supabase.from('marketplace_conversations').insert({
    id: conversationId,
    kind: 'support',
    listing_id: null,
    company_id: null,
    support_inquiry_id: inquiry.id,
    status: 'open',
  });
  if (error) throw new Error(error.message);

  await ensureParticipants(supabase, conversationId, [adminUserId, recipientUserId]);
  return conversationId;
}

async function ensureParticipants(
  supabase: SupabaseClient,
  conversationId: ConversationId,
  userIds: UserId[],
): Promise<void> {
  const unique = [...new Set(userIds)];
  for (const userId of unique) {
    const { error } = await supabase.from('marketplace_conversation_participants').upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
      },
      { onConflict: 'conversation_id,user_id', ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);
  }
}

function buildReplyBody(inquiry: SupportInquiry, body: string, includeContext: boolean): string {
  const trimmed = body.trim();
  if (!includeContext) return trimmed;
  const subject = SUPPORT_INQUIRY_SUBJECT_LABELS[inquiry.subject] ?? inquiry.subject;
  return [
    `Destek talebiniz hakkında (#${inquiry.id.slice(0, 8)})`,
    `Konu: ${subject}`,
    '',
    trimmed,
  ].join('\n');
}

export type SendSupportReplyResult = {
  inquiry: SupportInquiry;
  conversationId: string;
  messageId: string;
};

export async function sendSupportInquiryReply(params: {
  supabase: SupabaseClient;
  inquiryId: string;
  adminUserId: UserId;
  body: string;
  markStatus?: SupportInquiryStatus;
}): Promise<SendSupportReplyResult> {
  const { supabase, inquiryId, adminUserId, body, markStatus } = params;
  const trimmed = body.trim();
  if (trimmed.length < 1 || trimmed.length > 5000) {
    throw new Error('Mesaj 1–5000 karakter olmalıdır.');
  }

  const inquiry = await getSupportInquiry(supabase, inquiryId);
  if (!inquiry) throw new Error('Talep bulunamadı.');

  const recipientUserId = await resolveRecipientUserId(supabase, inquiry);
  if (!recipientUserId) {
    throw new Error(
      'Bu talep bir hesapla eşleşmiyor. Kullanıcı giriş yapmadan form doldurmuş; Mesajlarım’a iletilemez. E-posta ile yanıtlayın.',
    );
  }

  const conversationId = await ensureSupportConversation({
    supabase,
    adminUserId,
    recipientUserId,
    inquiry,
  });

  const isFirstOnInquiry = !inquiry.conversationId;
  const messageBody = buildReplyBody(inquiry, trimmed, isFirstOnInquiry);
  const messageId = ids.message(crypto.randomUUID()) as MessageId;
  const createdAt = new Date().toISOString();

  const { error: msgError } = await supabase.from('marketplace_messages').insert({
    id: messageId,
    conversation_id: conversationId,
    sender_id: adminUserId,
    body: messageBody,
    status: 'sent',
    attachment_urls: [],
    created_at: createdAt,
    updated_at: createdAt,
  });
  if (msgError) throw new Error(msgError.message);

  const { error: lastErr } = await supabase
    .from('marketplace_conversations')
    .update({
      last_message_at: createdAt,
      last_message_preview: messageBody.slice(0, 200),
      support_inquiry_id: inquiry.id,
      updated_at: createdAt,
    })
    .eq('id', conversationId);
  if (lastErr) throw new Error(lastErr.message);

  const stamp = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt));
  const noteLine = `[${stamp}] Mesaj gönderildi → Mesajlarım`;
  const nextNote = inquiry.adminNote?.trim()
    ? `${inquiry.adminNote.trim()}\n${noteLine}`
    : noteLine;

  const updated = await updateSupportInquiry(
    supabase,
    inquiry.id,
    {
      conversationId,
      adminNote: nextNote.slice(0, 2000),
      status: markStatus ?? (inquiry.status === 'new' ? 'reviewing' : inquiry.status),
    },
    adminUserId,
  );

  return {
    inquiry: updated,
    conversationId,
    messageId,
  };
}
