import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { createCareerMatchService } from '@/features/matching-engine/career-match.service';
import type { CareerMatchesResult } from '@/features/matching-engine/types';

export async function loadCareerMatchesPage(userId: string): Promise<CareerMatchesResult> {
  const supabase = createClient();
  const container = getServerContainer(supabase);
  const service = createCareerMatchService(container);
  return service.getCareerMatches(ids.user(userId));
}
