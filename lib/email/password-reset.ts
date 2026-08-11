import { sendTransactionalEmail } from '@/lib/email/send';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Send password-recovery mail with an action link (Supabase generateLink). */
export async function sendPasswordResetEmail(params: {
  to: string;
  actionLink: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = 'Şifre sıfırlama — Girisimbee';
  const text =
    `Girisimbee şifre sıfırlama\n\n`
    + `Bağlantıya tıklayarak yeni şifrenizi belirleyin:\n${params.actionLink}\n\n`
    + `Bu isteği siz yapmadıysanız bu e-postayı yok sayın.\n`;
  const html =
    `<p>Merhaba,</p>`
    + `<p>Girisimbee hesabınız için şifre sıfırlama istendi.</p>`
    + `<p><a href="${escapeHtml(params.actionLink)}" style="display:inline-block;padding:10px 16px;background:#5B5CF6;color:#fff;border-radius:8px;text-decoration:none">Şifremi sıfırla</a></p>`
    + `<p style="color:#64748b;font-size:13px;word-break:break-all">${escapeHtml(params.actionLink)}</p>`
    + `<p style="color:#64748b;font-size:13px">Bu isteği siz yapmadıysanız e-postayı yok sayın.</p>`;

  const result = await sendTransactionalEmail({
    to: params.to,
    subject,
    text,
    html,
  });

  if (result.ok) return { ok: true };
  if (result.skipped) {
    return { ok: false, error: `E-posta gönderimi yapılandırılmamış (${result.reason}).` };
  }
  return { ok: false, error: result.error };
}
