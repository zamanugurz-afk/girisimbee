/**
 * Human-facing listing reference numbers (e.g. GC-A1B2C3D4).
 * Derived from the listing UUID so every listing has a stable number without a DB migration.
 */
export function formatListingNumber(listingId: string): string {
  const hex = listingId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `GC-${hex}`;
}

/**
 * Parse a search/route query that looks like a listing number.
 * Accepts: GC-A1B2C3D4 | GC A1B2C3D4 | GCA1B2C3D4 | A1B2C3D4
 * Returns the 8-char hex prefix (lowercase) for UUID matching, or null.
 */
export function parseListingNumberQuery(query: string): string | null {
  const trimmed = query.trim().replace(/\s+/g, '');
  if (!trimmed) return null;

  const withPrefix = trimmed.match(/^GC-?([0-9A-Fa-f]{8})$/i);
  if (withPrefix) return withPrefix[1].toLowerCase();

  if (/^[0-9A-Fa-f]{8}$/.test(trimmed)) return trimmed.toLowerCase();

  return null;
}

/**
 * UUID range bounds for Postgres uuid comparison (avoids `uuid ~~` / LIKE).
 * Matches all UUIDs whose first segment equals `hex` (8 chars).
 */
export function listingIdRangeFromNumberHex(hex: string): { lo: string; hi: string } {
  const h = hex.toLowerCase();
  return {
    lo: `${h}-0000-0000-0000-000000000000`,
    hi: `${h}-ffff-ffff-ffff-ffffffffffff`,
  };
}

/** True when the query is (only) a listing-number style token. */
export function isListingNumberQuery(query: string): boolean {
  return parseListingNumberQuery(query) != null;
}
