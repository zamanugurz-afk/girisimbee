export const LISTING_EXPIRY_DAYS = 90;

export function computeListingExpiry(from: Date = new Date()): string {
  const expiry = new Date(from);
  expiry.setDate(expiry.getDate() + LISTING_EXPIRY_DAYS);
  return expiry.toISOString();
}
