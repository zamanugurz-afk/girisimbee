export const LISTING_EXPIRY_DAYS = 30;
export const FRANCHISE_LISTING_EXPIRY_DAYS = 30;

export function computeListingExpiry(
  from: Date = new Date(),
  days: number = LISTING_EXPIRY_DAYS,
): string {
  const expiry = new Date(from);
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

export function computeFranchiseListingExpiry(from: Date = new Date()): string {
  return computeListingExpiry(from, FRANCHISE_LISTING_EXPIRY_DAYS);
}
