import type {
  CreateSupportInquiryInput,
  SupportInquiry,
  SupportInquiryChannel,
  SupportInquiryStatus,
  UpdateSupportInquiryInput,
} from '@/features/support-inbox/types/support-inquiry.types';

async function supportFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export const supportPublicApi = {
  submit(input: CreateSupportInquiryInput) {
    return supportFetch<{ inquiry: { id: string; status: SupportInquiryStatus } }>(
      '/api/destek',
      { method: 'POST', body: JSON.stringify(input) },
    );
  },
};

export const supportAdminApi = {
  list(params?: { status?: SupportInquiryStatus; channel?: SupportInquiryChannel }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.channel) q.set('channel', params.channel);
    const qs = q.toString();
    return supportFetch<{ items: SupportInquiry[] }>(
      `/api/admin/destek${qs ? `?${qs}` : ''}`,
    ).then((r) => r.items);
  },
  update(id: string, input: UpdateSupportInquiryInput) {
    return supportFetch<{ item: SupportInquiry }>(`/api/admin/destek/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }).then((r) => r.item);
  },
  reply(
    id: string,
    input: { body: string; markStatus?: SupportInquiryStatus },
  ) {
    return supportFetch<{
      item?: SupportInquiry;
      inquiry: SupportInquiry;
      conversationId: string;
      messageId: string;
    }>(`/api/admin/destek/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  remove(id: string) {
    return supportFetch<void>(`/api/admin/destek/${id}`, { method: 'DELETE' });
  },
};
