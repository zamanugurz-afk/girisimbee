/**
 * TypeScript mirrors of PostgreSQL marketplace enums.
 * Keep in sync with supabase/migrations/20260801120000_ecosystem_enums.sql
 */

import type { ModuleKey } from '@/lib/domain/modules';

export type MatchStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'contacted'
  | 'closed_won'
  | 'closed_lost';

export type ApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'unlocked'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'hired';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentProvider = 'iyzico' | 'stripe' | 'paytr' | 'simulated';

export type PaymentPurpose =
  | 'publish'
  | 'unlock_candidate'
  | 'featured'
  | 'urgent'
  | 'package_purchase'
  | 'listing_placement'
  | 'franchise_package'
  | 'employer_package'
  | 'candidate_package'
  | 'entrepreneur_package'
  | 'investor_package'
  | 'founder_package'
  | 'market_ad';

export type DocumentType =
  | 'pitch_deck'
  | 'cv'
  | 'contract'
  | 'franchise_brochure'
  | 'other';

export type DocumentVisibility =
  | 'private'
  | 'match_only'
  | 'application_only'
  | 'public';

export type WorkflowStatus =
  | 'draft'
  | 'profile_created'
  | 'onboarding'
  | 'ready'
  | 'published'
  | 'matching'
  | 'reviewing'
  | 'negotiating'
  | 'completed'
  | 'archived';

export type ProfileModuleStatus = 'inactive' | 'onboarding' | 'active' | 'suspended';

export type SubcategoryStatus = 'active' | 'archived';

export type { ModuleKey };

/** External contact channels (v1 — no internal messaging) */
export interface ExternalContactInfo {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
}

/** Fields visible in anonymous job application preview */
export interface AnonymousApplicationSnapshot {
  city: string | null;
  district: string | null;
  industry: string | null;
  experienceYears: number | null;
  educationLevel: string | null;
  skills: string[];
  profileScore: number;
}

export const MATCH_STATUS_TRANSITIONS: Record<MatchStatus, readonly MatchStatus[]> = {
  requested: ['accepted', 'declined'],
  accepted: ['contacted', 'declined', 'closed_lost'],
  declined: [],
  contacted: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: [],
};

export const APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  submitted: ['reviewing', 'contacted', 'accepted', 'rejected', 'withdrawn'],
  reviewing: ['unlocked', 'contacted', 'accepted', 'rejected', 'withdrawn'],
  unlocked: ['contacted', 'hired', 'rejected', 'withdrawn'],
  contacted: ['hired', 'accepted', 'rejected', 'withdrawn'],
  accepted: ['withdrawn'],
  rejected: [],
  withdrawn: [],
  hired: [],
};

/** Franchise workflow — no unlock/payment gate; external contact only */
export const FRANCHISE_APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  submitted: ['reviewing', 'contacted', 'accepted', 'rejected', 'withdrawn'],
  reviewing: ['contacted', 'accepted', 'rejected', 'withdrawn'],
  unlocked: ['contacted', 'accepted', 'rejected', 'withdrawn'],
  contacted: ['accepted', 'rejected', 'withdrawn'],
  accepted: ['withdrawn'],
  rejected: [],
  withdrawn: [],
  hired: [],
};
