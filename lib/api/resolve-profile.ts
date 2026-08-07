import type { User } from '@supabase/supabase-js';
import type { PersistenceContainer } from '@/lib/persistence/container';
import type { Profile } from '@/features/profiles/types/profile.types';
import { ids } from '@/lib/domain/ids';
import { traceProfileAuth } from '@/lib/debug/profile-auth-trace';

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = meta?.display_name ?? meta?.displayName;
  if (typeof fromMeta === 'string' && fromMeta.trim().length >= 2) {
    return fromMeta.trim();
  }
  if (user.email) return user.email.split('@')[0];
  return 'User';
}

/** Resolve marketplace profile for an authenticated user, creating one if missing. */
export async function resolveProfileForUser(
  user: User,
  container: PersistenceContainer,
): Promise<Profile> {
  const userId = ids.user(user.id);

  traceProfileAuth('lookup_start', {
    authUid: user.id,
    userId,
    query: {
      table: 'marketplace_profiles',
      filters: { user_id: userId, deleted_at: null },
    },
  });

  let profile = await container.profileRepository.findByUserId(userId);

  traceProfileAuth('lookup_result', {
    authUid: user.id,
    profileId: profile?.id ?? null,
    found: Boolean(profile),
  });

  if (!profile) {
    const displayName = displayNameFromUser(user);

    traceProfileAuth('ensure_profile_start', {
      authUid: user.id,
      displayName,
      email: user.email ?? null,
    });

    profile = await container.profileService.ensureProfile(userId, displayName, user.email);

    traceProfileAuth('ensure_profile_created', {
      authUid: user.id,
      profileId: profile.id,
    });
  }

  return profile;
}
