import { now } from '@/lib/domain/factory';
import type { ApplicationId, ProfileId } from '@/lib/domain/ids';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type {
  FranchiseApplicationMetadata,
  FranchiseApplicationNote,
  FranchiseApplicationStatus,
  FranchiseApplicationStatusEvent,
} from '@/features/franchise/types/franchise-application.types';
import {
  APPLICATION_TO_FRANCHISE_STATUS,
  FRANCHISE_TO_APPLICATION_STATUS,
} from '@/features/franchise/types/franchise-application.types';

const METADATA_KEY = 'franchise' as const;

export function getFranchiseMetadata(
  application: MarketplaceApplication,
): FranchiseApplicationMetadata {
  const raw = application.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as FranchiseApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
  };
}

export function mergeFranchiseMetadata(
  application: MarketplaceApplication,
  patch: Partial<FranchiseApplicationMetadata>,
): Record<string, unknown> {
  const current = getFranchiseMetadata(application);
  return {
    ...application.metadata,
    [METADATA_KEY]: {
      ...current,
      ...patch,
      notes: patch.notes ?? current.notes,
      statusHistory: patch.statusHistory ?? current.statusHistory,
    },
  };
}

export function appendStatusHistory(
  application: MarketplaceApplication,
  franchiseStatus: FranchiseApplicationStatus,
  actorProfileId?: ProfileId,
): FranchiseApplicationStatusEvent[] {
  const { statusHistory = [] } = getFranchiseMetadata(application);
  const event: FranchiseApplicationStatusEvent = {
    status: franchiseStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  application: MarketplaceApplication,
  authorProfileId: ProfileId,
  text: string,
): FranchiseApplicationNote[] {
  const { notes = [] } = getFranchiseMetadata(application);
  const note: FranchiseApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toFranchiseStatus(
  status: MarketplaceApplication['status'],
): FranchiseApplicationStatus {
  return APPLICATION_TO_FRANCHISE_STATUS[status] ?? 'pending';
}

export function toApplicationStatus(
  status: FranchiseApplicationStatus,
): MarketplaceApplication['status'] {
  return FRANCHISE_TO_APPLICATION_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): FranchiseApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}

export type { ApplicationId };
