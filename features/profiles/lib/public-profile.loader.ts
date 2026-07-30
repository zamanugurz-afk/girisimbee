import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import type { PublicProfileView } from '@/features/profiles/types/profile-public.types';

export const loadPublicProfile = cache(
  async (username: string, viewerId?: UserId): Promise<PublicProfileView | null> => {
    const container = getServerContainer(createClient());
    return container.profileService.getPublicProfile(username, viewerId);
  },
);
