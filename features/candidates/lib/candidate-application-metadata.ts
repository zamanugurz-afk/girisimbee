import { now } from '@/lib/domain/factory';
import type { ProfileId } from '@/lib/domain/ids';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type {
  CandidateApplicationMetadata,
  CandidateApplicationNote,
  CandidateApplicationStatus,
  CandidateApplicationStatusEvent,
} from '@/features/candidates/types/candidate-application.types';
import {
  APPLICATION_TO_CANDIDATE_STATUS,
  CANDIDATE_TO_APPLICATION_STATUS,
} from '@/features/candidates/types/candidate-application.types';

const METADATA_KEY = 'candidate' as const;

export function getCandidateMetadata(
  application: MarketplaceApplication,
): CandidateApplicationMetadata {
  const raw = application.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as CandidateApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
  };
}

export function mergeCandidateMetadata(
  application: MarketplaceApplication,
  patch: Partial<CandidateApplicationMetadata>,
): Record<string, unknown> {
  const current = getCandidateMetadata(application);
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
  candidateStatus: CandidateApplicationStatus,
  actorProfileId?: ProfileId,
): CandidateApplicationStatusEvent[] {
  const { statusHistory = [] } = getCandidateMetadata(application);
  const event: CandidateApplicationStatusEvent = {
    status: candidateStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  application: MarketplaceApplication,
  authorProfileId: ProfileId,
  text: string,
): CandidateApplicationNote[] {
  const { notes = [] } = getCandidateMetadata(application);
  const note: CandidateApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toCandidateStatus(
  status: MarketplaceApplication['status'],
): CandidateApplicationStatus {
  return APPLICATION_TO_CANDIDATE_STATUS[status] ?? 'pending';
}

export function toApplicationStatus(
  status: CandidateApplicationStatus,
): MarketplaceApplication['status'] {
  return CANDIDATE_TO_APPLICATION_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): CandidateApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}
