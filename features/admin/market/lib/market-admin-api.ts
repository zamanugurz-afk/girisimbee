import type { MarketItem, MarketItemStatus } from '@/features/admin/market/types/market.types';

async function marketFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as { data: T };
  return json.data;
}

export type MarketItemInput = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string;
  sortOrder?: number;
  status?: MarketItemStatus;
};

export const marketAdminApi = {
  list(): Promise<MarketItem[]> {
    return marketFetch<{ items: MarketItem[] }>('/api/admin/market').then((r) => r.items);
  },
  create(input: MarketItemInput): Promise<MarketItem> {
    return marketFetch<{ item: MarketItem }>('/api/admin/market', {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((r) => r.item);
  },
  update(id: string, input: Partial<MarketItemInput>): Promise<MarketItem> {
    return marketFetch<{ item: MarketItem }>(`/api/admin/market/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }).then((r) => r.item);
  },
  remove(id: string): Promise<void> {
    return marketFetch(`/api/admin/market/${id}`, { method: 'DELETE' });
  },
  publish(id: string, publish: boolean): Promise<MarketItem> {
    const action = publish ? 'publish' : 'unpublish';
    return marketFetch<{ item: MarketItem }>(
      `/api/admin/market/${id}/publish?action=${action}`,
      { method: 'POST' },
    ).then((r) => r.item);
  },
};
