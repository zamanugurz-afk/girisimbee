/** Contact request policy — tune without code sprawl. */
export const CONTACT_REQUEST_CONFIG = {
  /** Pending request lifetime (days). */
  expiresInDays: 14,
  /** Max create attempts per user per hour (soft rate limit). */
  maxCreatesPerHour: 20,
  /** Required intro message length when sending a contact request. */
  messageMinLength: 30,
  messageMaxLength: 2000,
} as const;

export function computeContactRequestExpiresAt(from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + CONTACT_REQUEST_CONFIG.expiresInDays);
  return d.toISOString();
}
