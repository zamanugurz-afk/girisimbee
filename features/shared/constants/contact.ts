/**
 * Public contact addresses for GirisimBee (Zoho Mail aliases → info@ mailbox).
 * Keep all UI mailto links sourced from here.
 */
export const CONTACT_EMAILS = {
  /** Primary mailbox / SMTP sender */
  info: 'info@girisimbee.com',
  /** Support & general contact */
  support: 'destek@girisimbee.com',
  /** Advertising & partnership inquiries */
  ads: 'reklam@girisimbee.com',
} as const;

export type ContactEmailKey = keyof typeof CONTACT_EMAILS;

export const CONTACT_MAILTO = {
  info: `mailto:${CONTACT_EMAILS.info}`,
  support: `mailto:${CONTACT_EMAILS.support}`,
  ads: `mailto:${CONTACT_EMAILS.ads}`,
} as const;

/** Build a mailto URL with optional subject/body. */
export function contactMailto(
  key: ContactEmailKey,
  options?: { subject?: string; body?: string },
): string {
  const email = CONTACT_EMAILS[key];
  const params = new URLSearchParams();
  if (options?.subject) params.set('subject', options.subject);
  if (options?.body) params.set('body', options.body);
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}
