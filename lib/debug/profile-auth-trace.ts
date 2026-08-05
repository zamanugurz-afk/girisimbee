import { isAuthDebugEnabled } from '@/lib/debug/debug-flags';

/** Dev-only structured logging for profile auth resolution tracing. */
export function traceProfileAuth(step: string, data: Record<string, unknown>) {
  if (!isAuthDebugEnabled()) return;
  console.log(`[ProfileAuth:${step}]`, JSON.stringify(data, null, 2));
}
