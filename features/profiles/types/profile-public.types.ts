import type { Profile } from '@/features/profiles/types/profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';

export interface ProfileStats {
  listingsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface PublicProfileView {
  profile: Profile;
  stats: ProfileStats;
  listings: Listing[];
  isOwner: boolean;
}
