import { now } from '@/lib/domain/factory';
import type { ProfileId } from '@/lib/domain/ids';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type {
  EmployerApplicationMetadata,
  EmployerApplicationNote,
  EmployerApplicationStatus,
  EmployerApplicationStatusEvent,
} from '@/features/employers/types/employer-application.types';
import {
  APPLICATION_TO_EMPLOYER_STATUS,
  EMPLOYER_TO_APPLICATION_STATUS,
} from '@/features/employers/types/employer-application.types';

const METADATA_KEY = 'employer' as const;

export function getEmployerMetadata(
  application: MarketplaceApplication,
): EmployerApplicationMetadata {
  const raw = application.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as EmployerApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
  };
}

export function mergeEmployerMetadata(
  application: MarketplaceApplication,
  patch: Partial<EmployerApplicationMetadata>,
): Record<string, unknown> {
  const current = getEmployerMetadata(application);
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
  employerStatus: EmployerApplicationStatus,
  actorProfileId?: ProfileId,
): EmployerApplicationStatusEvent[] {
  const { statusHistory = [] } = getEmployerMetadata(application);
  const event: EmployerApplicationStatusEvent = {
    status: employerStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  application: MarketplaceApplication,
  authorProfileId: ProfileId,
  text: string,
): EmployerApplicationNote[] {
  const { notes = [] } = getEmployerMetadata(application);
  const note: EmployerApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toEmployerStatus(
  status: MarketplaceApplication['status'],
): EmployerApplicationStatus {
  return APPLICATION_TO_EMPLOYER_STATUS[status] ?? 'pending';
}

export function toApplicationStatus(
  status: EmployerApplicationStatus,
): MarketplaceApplication['status'] {
  return EMPLOYER_TO_APPLICATION_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): EmployerApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}
