/** Dev-only structured logging for profile auth resolution tracing. */
export function traceProfileAuth(step: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') return;

  console.log(`[ProfileAuth:${step}]`, JSON.stringify(data, null, 2));
}
