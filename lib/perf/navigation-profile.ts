import { AsyncLocalStorage } from 'async_hooks';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';

export interface NavProfileSpan {
  name: string;
  durationMs: number;
  cacheHit?: boolean;
}

export interface NavProfileSnapshot {
  path: string;
  middlewareMs: number;
  serverRenderMs: number;
  dbQueryMs: number;
  dbQueryCount: number;
  loaderSpans: NavProfileSpan[];
  cacheHits: number;
  cacheMisses: number;
}

interface NavProfileState {
  path: string;
  middlewareMs: number;
  loaderSpans: NavProfileSpan[];
  dbQueryMs: number;
  dbQueryCount: number;
  cacheHits: number;
  cacheMisses: number;
  renderStart: number;
}

const store = new AsyncLocalStorage<NavProfileState>();

export { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';

export function runWithNavProfile<T>(path: string, fn: () => T): T {
  if (!isNavProfilingEnabled()) return fn();

  return store.run(
    {
      path,
      middlewareMs: 0,
      loaderSpans: [],
      dbQueryMs: 0,
      dbQueryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      renderStart: performance.now(),
    },
    fn,
  );
}

export function setMiddlewareMs(ms: number): void {
  const state = store.getStore();
  if (state) state.middlewareMs = ms;
}

export async function profileSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (!isNavProfilingEnabled()) return fn();

  const start = performance.now();
  try {
    return await fn();
  } finally {
    const state = store.getStore();
    if (state) {
      state.loaderSpans.push({ name, durationMs: performance.now() - start });
    }
  }
}

export function recordDbQuery(durationMs: number): void {
  const state = store.getStore();
  if (!state) return;
  state.dbQueryMs += durationMs;
  state.dbQueryCount += 1;
}

export function recordCacheHit(): void {
  const state = store.getStore();
  if (state) state.cacheHits += 1;
}

export function recordCacheMiss(): void {
  const state = store.getStore();
  if (state) state.cacheMisses += 1;
}

export function getNavProfileSnapshot(): NavProfileSnapshot | null {
  const state = store.getStore();
  if (!state) return null;

  const serverRenderMs = performance.now() - state.renderStart;

  return {
    path: state.path,
    middlewareMs: state.middlewareMs,
    serverRenderMs,
    dbQueryMs: state.dbQueryMs,
    dbQueryCount: state.dbQueryCount,
    loaderSpans: state.loaderSpans,
    cacheHits: state.cacheHits,
    cacheMisses: state.cacheMisses,
  };
}
