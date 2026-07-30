import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';

export const loadPublicCompany = cache(
  async (username: string, viewerId?: UserId): Promise<PublicCompanyView | null> => {
    const container = getServerContainer(createClient());
    return container.companyService.getPublicView(username, viewerId);
  },
);
