type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();
const MAX_ENTRIES = 200;
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function prune(now: number) {
  if (store.size <= MAX_ENTRIES) return;
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
    if (store.size <= MAX_ENTRIES / 2) break;
  }
  if (store.size > MAX_ENTRIES) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
}

export function getInvestorAiCache<T>(key: string, now = Date.now()): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setInvestorAiCache<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS,
  now = Date.now(),
): void {
  prune(now);
  store.set(key, { value, expiresAt: now + ttlMs });
}

export function resetInvestorAiCacheForTests(): void {
  store.clear();
}
