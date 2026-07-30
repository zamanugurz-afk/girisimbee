'use client';

import { useMemo } from 'react';
import { getListingById } from '@/features/listings/services/listing.service';
import type { ListingDetail } from '@/features/listings/types/listing.types';

export function useListing(id: string): ListingDetail | undefined {
  return useMemo(() => getListingById(id), [id]);
}
