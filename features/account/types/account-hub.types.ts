/** View-model for Hesap Merkezi overview — assembled from existing loaders only. */

export interface AccountHubViewModel {
  displayName: string;
  username: string | null;
  /** Auth / account email — shown on hub (collected at signup) */
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  /** Auth `email_confirmed_at` is source of truth */
  emailVerified: boolean;
  phoneVerified: boolean;
  followersCount: number;
  followingCount: number;
}
