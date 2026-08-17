import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { createPartnershipMatchService } from '@/features/partnership-matching/service';
import type { PartnershipMatchesResult } from '@/features/partnership-matching/types';

export async function loadPartnershipMatchesPage(userId: string): Promise<PartnershipMatchesResult> {
  const supabase = createClient();
  const container = getServerContainer(supabase);
  const service = createPartnershipMatchService(container);
  return service.getPartnershipMatches(ids.user(userId));
}
