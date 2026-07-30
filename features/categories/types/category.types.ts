export type CategoryIntentId =
  | 'find-investment'
  | 'invest'
  | 'find-job'
  | 'hire'
  | 'find-partner';

/** @deprecated Use CategoryIntentId */
export type IntentId = CategoryIntentId;

export type ContentType = 'person' | 'startup' | 'job' | 'company' | 'article' | 'story';

export type { TrustBadges } from '@/features/authentication/types/trust.types';
import type { TrustBadges } from '@/features/authentication/types/trust.types';

export interface ContentItem {
  id: string;
  /** Domain listing UUID — used for favorites persistence. */
  listingId?: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  detail?: string;
  location?: string;
  tag?: string;
  timeAgo?: string;
  emoji?: string;
  initials?: string;
  meta?: string;
  trust?: TrustBadges;
}

export interface CategorySection {
  id: string;
  title: string;
  items: ContentItem[];
}

export interface CategoryIntent {
  id: CategoryIntentId;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  accentMuted: string;
  sections: CategorySection[];
  activity: { emoji: string; text: string; time: string }[];
}

/** @deprecated Use CategoryIntent */
export type IntentConfig = CategoryIntent;

/** @deprecated Use CategorySection */
export type IntentSection = CategorySection;
