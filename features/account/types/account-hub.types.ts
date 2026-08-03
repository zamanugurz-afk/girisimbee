/** View-model for Hesap Merkezi overview — assembled from existing loaders only. */

export interface AccountHubViewModel {
  displayName: string;
  username: string | null;
  phone: string | null;
  linkedInUrl: string | null;
  website: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  userVerified: boolean;
  investorVerified: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
  /** UI parity — no dedicated DB field; mirrors website visibility for display */
  linkedInVisible: boolean;
  websiteVisible: boolean;
}
