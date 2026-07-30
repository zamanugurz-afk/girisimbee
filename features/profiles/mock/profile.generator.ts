import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter, pickCity, pickSkills, loremWords } from '@/lib/domain/mock-utils';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import type { Profile, ProfileIntent } from '@/features/profiles/types/profile.types';
import type { UserId } from '@/lib/domain/ids';

const INTENTS: ProfileIntent[] = [
  'seeking_investment', 'investing', 'seeking_job', 'hiring', 'seeking_partner', 'open',
];

export function generateMockProfile(index = 1, userId?: UserId): Profile {
  return createProfile({
    id: ids.profile(mockUuid('b0000001')),
    userId: userId ?? ids.user(mockUuid('a0000001')),
    displayName: `Kullanıcı ${index}`,
    headline: `${pickCity(index)} merkezli girişimci`,
    bio: loremWords(20),
    city: pickCity(index),
    country: 'TR',
    skills: pickSkills(index),
    intents: [INTENTS[index % INTENTS.length]],
    status: 'published',
    isVerified: index % 4 === 0,
    completenessScore: Math.min(100, 40 + index * 5),
  });
}

export function generateMockProfiles(count: number, userId?: UserId): Profile[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockProfile(i + 1, userId));
}
