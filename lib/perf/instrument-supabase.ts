import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { recordDbQuery } from '@/lib/perf/navigation-profile';

function instrumentSupabaseClient(client: SupabaseClient): SupabaseClient {
  const queryBuilder = client.from.bind(client);

  client.from = ((table: string) => {
    const builder = queryBuilder(table);
    return wrapQueryBuilder(builder);
  }) as typeof client.from;

  return client;
}

function wrapQueryBuilder(builder: unknown): unknown {
  if (!builder || typeof builder !== 'object') return builder;

  return new Proxy(builder as object, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;

      if (prop === 'then') {
        return (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          const start = performance.now();
          return (value as (...args: unknown[]) => Promise<unknown>)
            .call(target)
            .then(
              (result) => {
                recordDbQuery(performance.now() - start);
                return onFulfilled ? onFulfilled(result) : result;
              },
              (error) => (onRejected ? onRejected(error) : Promise.reject(error)),
            );
        };
      }

      return (...args: unknown[]) => wrapQueryBuilder(value.apply(target, args));
    },
  });
}

export function createInstrumentedServerClient(
  url: string,
  key: string,
  cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string, options: CookieOptions): void;
    remove(name: string, options: CookieOptions): void;
  },
): SupabaseClient {
  const client = createServerClient(url, key, { cookies });
  return instrumentSupabaseClient(client);
}
