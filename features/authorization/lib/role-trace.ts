/**
 * Temporary role-flow diagnostics — search console for `[role-trace]`.
 * Off by default; enable with DEBUG_ROLE_TRACE=1 or DEBUG_AUTH=1.
 */
import { isAuthDebugEnabled } from '@/lib/debug/debug-flags';

export function roleTrace(step: string, payload: Record<string, unknown>): void {
  if (!isAuthDebugEnabled()) return;
  // eslint-disable-next-line no-console -- intentional role-debug trail
  console.log(`[role-trace] ${step}`, payload);
}

/** Normalize whitespace / separators without collapsing super_admin. */
export function canonicalizeRoleKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}
