import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseListingPayload } from '@/features/franchise/types/franchise-listing.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';

async function franchiseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `İstek başarısız (${res.status})`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

/** Publish franchise listing via REST API (buy or give flow). */
export async function publishFranchiseListing(
  payload: FranchiseListingPayload & { flow: FranchiseFlow },
): Promise<Listing> {
  const data = await franchiseFetch<{ listing: Listing }>('/api/franchise/listings?publish=true', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.listing;
}
