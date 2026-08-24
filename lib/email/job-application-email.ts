import { sendTransactionalEmail } from '@/lib/email/send';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'https://girisimbee.com'
  ).replace(/\/+$/, '');
}

export interface JobApplicationEmailParams {
  to: string;
  applicantName: string;
  positionTitle: string;
  conversationId: string;
  applicationId?: string;
}

/**
 * Sends a secure notification to the employer when a new job application is received.
 * ZERO PII policy: Does NOT expose phone, email, address, or full CV in the email body.
 */
export function buildJobApplicationEmployerEmailHtml({
  positionTitle,
  applicantName,
  conversationUrl,
}: {
  positionTitle: string;
  applicantName: string;
  conversationUrl: string;
  appliedAt?: string;
}): string {
  const safePosition = escapeHtml(positionTitle);
  const safeApplicant = escapeHtml(applicantName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni iş başvurusu — ${safePosition}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#059669 0%,#047857 100%);color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em;">Girisimbee</h1>
              <p style="margin:4px 0 0 0;font-size:13px;opacity:0.9;">Yeni İş Başvurusu Bildirimi</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#334155;">
                Merhaba,
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#334155;">
                Yayınladığınız ilana yeni bir iş başvurusu geldi.
              </p>
              
              <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:28px;border-left:4px solid #059669;">
                <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Başvuru Detayı</p>
                <p style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#0f172a;">${safePosition}</p>
                <p style="margin:0;font-size:14px;color:#475569;">Aday: <strong>${safeApplicant}</strong></p>
              </div>

              <p style="margin:0 0 28px 0;font-size:14px;line-height:22px;color:#64748b;">
                Güvenlik ve KVKK gereği, adayın tam kariyer profili ve iletişim bilgileri yalnızca Girisimbee platformu üzerinden görüntülenebilir.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${conversationUrl}" style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;box-shadow:0 2px 4px rgba(5,150,105,0.2);">
                      BAŞVURUYU GÖRÜNTÜLE
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
              <p style="margin:0;">Bu e-posta Girisimbee platformundaki ilanınıza gelen başvuru için otomatik olarak gönderilmiştir.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a secure notification to the employer when a new job application is received.
 * ZERO PII policy: Does NOT expose phone, email, address, or full CV in the email body.
 */
export async function sendJobApplicationEmployerNotification(
  params: JobApplicationEmailParams,
): Promise<void> {
  const baseUrl = getAppBaseUrl();
  const targetUrl = `${baseUrl}/mesajlarim?c=${encodeURIComponent(params.conversationId)}`;
  const subject = `Yeni iş başvurusu — ${params.positionTitle}`;

  const textBody = `Merhaba,

İlanınıza yeni bir iş başvurusu geldi.

Pozisyon: ${params.positionTitle}
Aday: ${params.applicantName}

Başvuruyu ve adayın gönderdiği kariyer profilini Girisimbee üzerinden görüntüleyebilirsiniz:
${targetUrl}

Girisimbee`;

  const htmlBody = buildJobApplicationEmployerEmailHtml({
    positionTitle: params.positionTitle,
    applicantName: params.applicantName,
    conversationUrl: targetUrl,
  });

  await sendTransactionalEmail({
    to: params.to,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

export interface JobApplicationStatusEmailParams {
  to: string;
  applicantName: string;
  positionTitle: string;
  statusLabel: string;
  conversationId: string;
}

/**
 * Notifies the candidate when the employer updates their application status.
 */
export async function sendJobApplicationStatusNotification(
  params: JobApplicationStatusEmailParams,
): Promise<void> {
  const baseUrl = getAppBaseUrl();
  const targetUrl = `${baseUrl}/mesajlarim?c=${encodeURIComponent(params.conversationId)}`;
  const subject = `Başvuru durumunuz güncellendi — ${params.positionTitle}`;
  const safePosition = escapeHtml(params.positionTitle);
  const safeApplicant = escapeHtml(params.applicantName);
  const safeStatus = escapeHtml(params.statusLabel);

  const textBody = `Merhaba ${params.applicantName},

"${params.positionTitle}" pozisyonuna yaptığınız başvurunun durumu "${params.statusLabel}" olarak güncellendi.

Detayları ve mesajlarınızı Girisimbee üzerinden görüntüleyebilirsiniz:
${targetUrl}

Girisimbee`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:700;">Girisimbee</h1>
              <p style="margin:4px 0 0 0;font-size:13px;opacity:0.9;">Başvuru Durumu Güncellemesi</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#334155;">
                Merhaba <strong>${safeApplicant}</strong>,
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#334155;">
                <strong>${safePosition}</strong> pozisyonuna yaptığınız başvurunun durumu güncellendi:
              </p>
              
              <div style="background:#f0f9ff;border-radius:12px;padding:18px 20px;margin-bottom:28px;border-left:4px solid #0284c7;">
                <p style="margin:0;font-size:15px;font-weight:600;color:#0369a1;">Yeni Durum: ${safeStatus}</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${targetUrl}" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;box-shadow:0 2px 4px rgba(2,132,199,0.2);">
                      BAŞVURUYU GÖRÜNTÜLE
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
              <p style="margin:0;">Girisimbee Kariyer Bildirimleri</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendTransactionalEmail({
    to: params.to,
    subject,
    text: textBody,
    html: htmlBody,
  });
}
