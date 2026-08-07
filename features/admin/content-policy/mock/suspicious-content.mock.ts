/** Mock queue for listings flagged as suspicious / pending admin review. */

export type SuspiciousQueueStatus = 'pending' | 'approved' | 'rejected';

export interface SuspiciousContentItem {
  id: string;
  listingId: string | null;
  title: string;
  snippet: string;
  flags: string[];
  ownerLabel: string;
  status: SuspiciousQueueStatus;
  createdAt: string;
  updatedAt: string;
}

const SEED: SuspiciousContentItem[] = [
  {
    id: 'sc-1',
    listingId: null,
    title: 'Ornek Ilan Sahibinden Benzeri',
    snippet: 'Sahibinden tarzı fırsat, wp yazın…',
    flags: ['competitor', 'call_me'],
    ownerLabel: 'demo@girisimbee.com',
    status: 'pending',
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
];

let store: SuspiciousContentItem[] = SEED.map((row) => ({ ...row }));

export function cloneSuspiciousQueue(): SuspiciousContentItem[] {
  return store.map((row) => ({ ...row }));
}

export function replaceSuspiciousQueue(next: SuspiciousContentItem[]): void {
  store = next.map((row) => ({ ...row }));
}

export function enqueueSuspiciousContent(input: {
  listingId?: string | null;
  title: string;
  snippet: string;
  flags: string[];
  ownerLabel?: string;
}): SuspiciousContentItem {
  const now = new Date().toISOString();
  const item: SuspiciousContentItem = {
    id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    listingId: input.listingId ?? null,
    title: input.title,
    snippet: input.snippet.slice(0, 180),
    flags: input.flags,
    ownerLabel: input.ownerLabel ?? 'kullanıcı',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  store = [item, ...store];
  return item;
}
