import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Profile, CreateProfileInput } from '@/features/profiles/types/profile.types';

export function createProfile(overrides: Partial<Profile> & Pick<Profile, 'userId' | 'displayName'>): Profile {
  const ts = timestamps(overrides.createdAt);
  const username = overrides.username ?? null;
  return {
    id: overrides.id ?? ids.profile(crypto.randomUUID()),
    userId: overrides.userId,
    companyId: overrides.companyId ?? null,
    username,
    displayName: overrides.displayName,
    headline: overrides.headline ?? null,
    bio: overrides.bio ?? null,
    avatarUrl: overrides.avatarUrl ?? null,
    coverUrl: overrides.coverUrl ?? null,
    location: overrides.location ?? null,
    city: overrides.city ?? null,
    country: overrides.country ?? 'TR',
    companyName: overrides.companyName ?? null,
    position: overrides.position ?? null,
    website: overrides.website ?? null,
    linkedInUrl: overrides.linkedInUrl ?? null,
    twitterUrl: overrides.twitterUrl ?? null,
    phone: overrides.phone ?? null,
    email: overrides.email ?? null,
    emailVisible: overrides.emailVisible ?? false,
    phoneVisible: overrides.phoneVisible ?? false,
    websiteVisible: overrides.websiteVisible ?? true,
    skills: overrides.skills ?? [],
    intents: overrides.intents ?? ['open'],
    visibility: overrides.visibility ?? 'public',
    status: overrides.status ?? 'draft',
    isVerified: overrides.isVerified ?? false,
    investorVerified: overrides.investorVerified ?? false,
    completenessScore: overrides.completenessScore ?? 0,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createProfileInput(overrides: Partial<CreateProfileInput> = {}): CreateProfileInput {
  return {
    userId: overrides.userId ?? ids.user(crypto.randomUUID()),
    displayName: overrides.displayName ?? 'Test User',
    headline: overrides.headline,
    companyId: overrides.companyId,
    intents: overrides.intents,
  };
}
