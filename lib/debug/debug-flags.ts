/**
 * Hot-path debug logging gate.
 * Enable with DEBUG_AUTH=1 or NEXT_PUBLIC_DEBUG_AUTH=1 (and optionally DEBUG_ROLE_TRACE).
 * Default OFF — verbose traces were slowing every page navigation in dev.
 */
export function isAuthDebugEnabled(): boolean {
  return (
    process.env.DEBUG_AUTH === '1'
    || process.env.NEXT_PUBLIC_DEBUG_AUTH === '1'
    || process.env.DEBUG_ROLE_TRACE === '1'
    || process.env.NEXT_PUBLIC_DEBUG_ROLE_TRACE === '1'
  );
}

export function isListingDebugEnabled(): boolean {
  return (
    process.env.DEBUG_LISTINGS === '1'
    || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1'
  );
}
