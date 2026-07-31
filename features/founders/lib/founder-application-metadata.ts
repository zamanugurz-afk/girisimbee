import { now } from '@/lib/domain/factory';
import type { MatchId, ProfileId } from '@/lib/domain/ids';
import type { Match } from '@/features/matching/types/match.types';
import type {
  FounderApplicationMetadata,
  FounderApplicationNote,
  FounderApplicationStatus,
  FounderApplicationStatusEvent,
} from '@/features/founders/types/founder-application.types';
import {
  MATCH_TO_FOUNDER_STATUS,
  FOUNDER_TO_MATCH_STATUS,
} from '@/features/founders/types/founder-application.types';

const METADATA_KEY = 'founder' as const;

export function getFounderMetadata(match: Match): FounderApplicationMetadata {
  const raw = match.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as FounderApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    coverMessage: data.coverMessage ?? null,
    withdrawn: data.withdrawn ?? false,
  };
}

export function mergeFounderMetadata(
  match: Match,
  patch: Partial<FounderApplicationMetadata>,
): Record<string, unknown> {
  const current = getFounderMetadata(match);
  return {
    ...match.metadata,
    [METADATA_KEY]: {
      ...current,
      ...patch,
      notes: patch.notes ?? current.notes,
      statusHistory: patch.statusHistory ?? current.statusHistory,
    },
  };
}

export function appendStatusHistory(
  match: Match,
  founderStatus: FounderApplicationStatus,
  actorProfileId?: ProfileId,
): FounderApplicationStatusEvent[] {
  const { statusHistory = [] } = getFounderMetadata(match);
  const event: FounderApplicationStatusEvent = {
    status: founderStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  match: Match,
  authorProfileId: ProfileId,
  text: string,
): FounderApplicationNote[] {
  const { notes = [] } = getFounderMetadata(match);
  const note: FounderApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toFounderStatus(match: Match): FounderApplicationStatus {
  const meta = getFounderMetadata(match);
  if (meta.withdrawn) return 'withdrawn';
  return MATCH_TO_FOUNDER_STATUS[match.status] ?? 'pending';
}

export function toMatchStatus(
  status: FounderApplicationStatus,
): Match['status'] | null {
  return FOUNDER_TO_MATCH_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): FounderApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}

export type { MatchId };
