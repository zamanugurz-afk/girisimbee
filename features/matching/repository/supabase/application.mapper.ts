import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import type { ApplicationId, ListingId, ProfileId, PaymentId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type {
  ApplicationStatus,
  AnonymousApplicationSnapshot,
} from '@/lib/domain/marketplace-enums';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';

export interface ApplicationRow {
  id: string;
  module_key: string;
  listing_id: string;
  applicant_profile_id: string;
  status: string;
  cover_message: string | null;
  anonymous_snapshot: AnonymousApplicationSnapshot;
  unlocked_at: string | null;
  payment_id: string | null;
  contacted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function mapApplicationRow(row: ApplicationRow): MarketplaceApplication {
  return {
    id: row.id as ApplicationId,
    moduleKey: row.module_key as Extract<ModuleKey, 'candidates' | 'employers' | 'franchise'>,
    listingId: row.listing_id as ListingId,
    applicantProfileId: row.applicant_profile_id as ProfileId,
    status: row.status as ApplicationStatus,
    coverMessage: row.cover_message,
    anonymousSnapshot: row.anonymous_snapshot ?? {
      city: null,
      district: null,
      industry: null,
      experienceYears: null,
      educationLevel: null,
      skills: [],
      profileScore: 0,
    },
    unlockedAt: row.unlocked_at,
    paymentId: row.payment_id as PaymentId | null,
    contactedAt: row.contacted_at,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export function toApplicationRow(input: Partial<MarketplaceApplication>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.moduleKey !== undefined) row.module_key = input.moduleKey;
  if (input.listingId !== undefined) row.listing_id = input.listingId;
  if (input.applicantProfileId !== undefined) row.applicant_profile_id = input.applicantProfileId;
  if (input.status !== undefined) row.status = input.status;
  if (input.coverMessage !== undefined) row.cover_message = input.coverMessage;
  if (input.anonymousSnapshot !== undefined) row.anonymous_snapshot = input.anonymousSnapshot;
  if (input.unlockedAt !== undefined) row.unlocked_at = input.unlockedAt;
  if (input.paymentId !== undefined) row.payment_id = input.paymentId;
  if (input.contactedAt !== undefined) row.contacted_at = input.contactedAt;
  if (input.metadata !== undefined) row.metadata = input.metadata;
  if (input.deletedAt !== undefined) row.deleted_at = input.deletedAt;
  return row;
}
