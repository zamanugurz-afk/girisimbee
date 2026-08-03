/**
 * Temporary role-flow diagnostics — search console for `[role-trace]`.
 * Remove once super_admin display is confirmed.
 */
export function roleTrace(step: string, payload: Record<string, unknown>): void {
  // eslint-disable-next-line no-console -- intentional role-debug trail
  console.log(`[role-trace] ${step}`, payload);
}

/** Normalize whitespace / separators without collapsing super_admin. */
export function canonicalizeRoleKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}
