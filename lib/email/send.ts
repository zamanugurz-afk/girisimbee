/**
 * Transactional email helper — Resend first, then SMTP (SMTP_* env).
 * Callers decide whether a skipped/failed send should fail the primary action.
 */

import { sendSmtpEmail } from '@/lib/email/smtp';

export type TransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type TransactionalEmailResult =
  | { ok: true; id?: string; via: 'resend' | 'smtp' }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    'Girisimbee <onboarding@resend.dev>';

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
          reply_to: input.replyTo,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok) {
        return { ok: true, id: json.id, via: 'resend' };
      }
      console.warn('[email] resend failed, trying SMTP', json.message || `HTTP ${res.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'send failed';
      console.warn('[email] resend exception, trying SMTP', message);
    }
  }

  const smtp = await sendSmtpEmail({
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (smtp.ok) {
    return { ok: true, id: smtp.id, via: 'smtp' };
  }
  if (smtp.skipped) {
    return {
      ok: false,
      skipped: true,
      reason: apiKey ? `resend failed; ${smtp.reason}` : smtp.reason,
    };
  }
  return { ok: false, skipped: false, error: smtp.error };
}

export async function sendAdInquiryConfirmation(params: {
  to: string;
  fullName: string;
  kind: 'market_ad' | 'partnership';
  inquiryId: string;
}): Promise<void> {
  const isMarket = params.kind === 'market_ad';
  const subject = isMarket
    ? 'MARKET reklam talebiniz alındı — Girisimbee'
    : 'İşbirliği talebiniz alındı — Girisimbee';
  const body = isMarket
    ? 'MARKET reklam talebiniz alındı. Ödeme tamamlandığında kartınız yayınlanır; ekip gerekirse sizinle iletişime geçer.'
    : 'Özel işbirliği talebiniz alındı. Ekibimiz en kısa sürede e-posta veya telefon ile dönüş yapacak.';

  await sendTransactionalEmail({
    to: params.to,
    subject,
    text: `Merhaba ${params.fullName},\n\n${body}\n\nTalep no: ${params.inquiryId}\n\nGirisimbee`,
    html: `<p>Merhaba ${escapeHtml(params.fullName)},</p><p>${escapeHtml(body)}</p><p style="color:#64748b;font-size:13px">Talep no: ${escapeHtml(params.inquiryId)}</p><p>Girisimbee</p>`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
