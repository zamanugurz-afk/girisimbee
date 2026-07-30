import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { fetchSessionUser } from '@/features/authentication/services/supabase-auth.service';
import type { SessionUser } from '@/features/authentication/types/auth.types';
import { profileSpan, recordCacheMiss } from '@/lib/perf/navigation-profile';

/** Dedupe session lookup within a single RSC request (page + generateMetadata). */
export const getServerSession = cache(async (): Promise<SessionUser | null> => {
  recordCacheMiss();
  return profileSpan('getServerSession', async () => {
    const supabase = createClient();
    return fetchSessionUser(supabase);
  });
});
