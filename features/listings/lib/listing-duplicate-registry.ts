/**
 * In-memory fingerprints of published / submitted listing texts (duplicate gate).
 * Cleared on full page reload — enough for UI/dev until DB unique constraint exists.
 */

import { listingTextFingerprint } from '@/features/listings/lib/listing-content-policy';

const fingerprints = new Set<string>();

export function getListingTextFingerprints(): string[] {
  return [...fingerprints];
}

export function registerListingTextFingerprint(title: string, shortDescription: string): void {
  const fp = listingTextFingerprint(title, shortDescription);
  if (fp.length >= 24) fingerprints.add(fp);
}

export function hasListingTextFingerprint(title: string, shortDescription: string): boolean {
  const fp = listingTextFingerprint(title, shortDescription);
  return fp.length >= 24 && fingerprints.has(fp);
}
