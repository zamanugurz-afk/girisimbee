import type {
  AdInquiry,
  AdInquiryKind,
  AdInquiryStatus,
  CreateAdInquiryInput,
  UpdateAdInquiryInput,
} from '@/features/ads/types/ad-inquiry.types';

async function adsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
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

export const adsPublicApi = {
  submit(input: CreateAdInquiryInput) {
    return adsFetch<{ inquiry: { id: string; kind: AdInquiryKind; status: AdInquiryStatus } }>(
      '/api/reklam',
      { method: 'POST', body: JSON.stringify(input) },
    );
  },
  checkoutMarketAd(input: Omit<Extract<CreateAdInquiryInput, { kind: 'market_ad' }>, 'kind'>) {
    return adsFetch<{
      checkout:
        | {
            mode: 'redirect';
            checkoutUrl: string;
            inquiryId: string;
            paymentId: string;
            provider: string;
          }
        | {
            mode: 'instant';
            inquiryId: string;
            paymentId: string;
            marketItem: { id: string };
            provider: string;
          };
    }>('/api/reklam/checkout', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export const adsAdminApi = {
  list(params?: { status?: AdInquiryStatus; kind?: AdInquiryKind }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.kind) q.set('kind', params.kind);
    const qs = q.toString();
    return adsFetch<{ items: AdInquiry[] }>(`/api/admin/reklam${qs ? `?${qs}` : ''}`).then(
      (r) => r.items,
    );
  },
  update(id: string, input: UpdateAdInquiryInput) {
    return adsFetch<{ item: AdInquiry }>(`/api/admin/reklam/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }).then((r) => r.item);
  },
  remove(id: string) {
    return adsFetch<void>(`/api/admin/reklam/${id}`, { method: 'DELETE' });
  },
};
