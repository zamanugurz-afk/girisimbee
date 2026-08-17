import { maskDisplaySurname } from '@/features/candidates/lib/career-public-identity';
import type { CareerListingKind } from '@/features/matching-engine/types';

export function resolveMatchPartyLabel(input: {
  kind: CareerListingKind;
  companyName?: string | null;
  ownerDisplayName?: string | null;
}): string {
  const company = input.companyName?.trim() || null;
  if (input.kind === 'hire') {
    return company || input.ownerDisplayName?.trim() || 'İlan sahibi';
  }
  return maskDisplaySurname(input.ownerDisplayName) || 'Anonim aday';
}
