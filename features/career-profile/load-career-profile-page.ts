import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import type { CareerProfilePageData } from '@/features/career-profile/types';

export async function loadCareerProfilePage(userId: string): Promise<CareerProfilePageData> {
  const supabase = createClient();
  const container = getServerContainer(supabase);
  const service = new CareerProfileService(container.listingRepository);
  return service.getPageData(ids.user(userId));
}
