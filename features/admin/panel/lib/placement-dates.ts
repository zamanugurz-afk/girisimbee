/** Remaining whole days until expires_at (0 if past or invalid). */
export function calcRemainingDays(expiresAt: string, now = new Date()): number {
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return 0;
  const diff = end - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function extendExpiresAt(expiresAt: string, days: number, now = new Date()): string {
  const baseMs = new Date(expiresAt).getTime();
  const startFrom = Number.isNaN(baseMs) || baseMs < now.getTime() ? now.getTime() : baseMs;
  const next = new Date(startFrom);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}
