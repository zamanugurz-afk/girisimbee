/**
 * Optional SMTP transport (SMTP_HOST / SMTP_USER / SMTP_PASSWORD).
 * Used when Resend is unavailable — e.g. password-recovery mail.
 */

export type SmtpSendInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SmtpSendResult =
  | { ok: true; id?: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

/** Ensure Gmail/inbox shows "Girisimbee", not a bare address or old brand. */
function resolveSmtpFrom(raw: string): string {
  const value = raw.trim();
  if (!value) return 'Girisimbee <info@girisimbee.com>';
  if (value.includes('<') && value.includes('>')) {
    // Replace legacy display names while keeping the mailbox.
    return value.replace(/^\s*[^<]+</, 'Girisimbee <');
  }
  return `Girisimbee <${value}>`;
}

export async function sendSmtpEmail(input: SmtpSendInput): Promise<SmtpSendResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const from = resolveSmtpFrom(
    process.env.SMTP_FROM?.trim()
    || process.env.EMAIL_FROM?.trim()
    || user
    || 'info@girisimbee.com',
  );

  if (!host || !user || !pass) {
    return { ok: false, skipped: true, reason: 'SMTP_* env incomplete' };
  }

  const port = Number(process.env.SMTP_PORT?.trim() || '587');
  const secure =
    process.env.SMTP_SECURE?.trim() === 'true' || port === 465;

  try {
    const nodemailer = await import('nodemailer');
    const resolvedPort = Number.isFinite(port) ? port : 587;
    const transporter = nodemailer.createTransport({
      host,
      port: resolvedPort,
      secure,
      // Zoho / Gmail / most providers expect STARTTLS on 587.
      requireTLS: !secure && resolvedPort === 587,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return { ok: true, id: typeof info.messageId === 'string' ? info.messageId : undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP send failed';
    console.warn('[email/smtp] send failed', message);
    return { ok: false, skipped: false, error: message };
  }
}
