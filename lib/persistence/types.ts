export type PersistenceDriver = 'memory' | 'supabase';

export function resolvePersistenceDriver(): PersistenceDriver {
  const configured = process.env.NEXT_PUBLIC_PERSISTENCE_DRIVER;
  if (configured === 'memory') return 'memory';
  if (configured === 'supabase') return 'supabase';

  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return hasSupabase ? 'supabase' : 'memory';
}
